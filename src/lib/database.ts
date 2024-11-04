import { supabase } from './supabase';
import type { Database } from '../types';

type Tables = Database['public']['Tables'];

export async function getStatistics() {
  const { data, error } = await supabase
    .from('statistics')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching statistics:', error);
    return {
      total_searches: 0,
      closed_cases: 0,
      volunteers: 0,
      public_users: 0,
      last_updated: new Date().toISOString()
    };
  }
  
  return {
    total_searches: data.total_searches,
    closed_cases: data.closed_cases,
    volunteers: data.total_volunteers,
    public_users: data.total_users,
    last_updated: data.updated_at
  };
}

export async function getMissingPersons(eventId?: string | null) {
  const query = supabase
    .from('missing_persons')
    .select(`
      *,
      profiles:reported_by (
        first_name,
        last_name,
        email
      ),
      status_types:current_status_id (
        name
      ),
      status_updates:status_updates (
        id,
        status_id,
        address,
        last_city,
        last_state,
        zip,
        last_seen_date,
        notes,
        case_closed,
        created_at,
        net_id,
        frequency,
        status_types:status_id (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (eventId) {
    query.eq('event_id', eventId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMissingPersonById(id: string) {
  const { data, error } = await supabase
    .from('missing_persons')
    .select(`
      *,
      profiles:reported_by (
        first_name,
        last_name,
        email
      ),
      status_types:current_status_id (
        name
      ),
      status_updates:status_updates (
        id,
        status_id,
        address,
        last_city,
        last_state,
        zip,
        last_seen_date,
        notes,
        case_closed,
        created_at,
        net_id,
        frequency,
        status_types:status_id (
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProfile(profile: Tables['profiles']['Insert']) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;

  // Update statistics for new user
  await supabase.rpc('increment_total_users');

  return data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles:role_id (name)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Tables['profiles']['Update']
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Update volunteer count if necessary
  if (typeof updates.is_volunteer !== 'undefined') {
    if (updates.is_volunteer) {
      await supabase.rpc('increment_total_volunteers');
    } else {
      await supabase.rpc('decrement_total_volunteers');
    }
  }

  return data;
}

export async function ensureDefaultEvent() {
  // Check for existing events
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);

  if (events && events.length > 0) {
    return events[0].id;
  }

  // Create a default event if none exists
  const { data: newEvent, error } = await supabase
    .from('events')
    .insert({
      name: 'General Emergency Response',
      date: new Date().toISOString(),
      description: 'Default emergency response event'
    })
    .select()
    .single();

  if (error) throw error;
  return newEvent.id;
}

export async function createMissingPersonWithStatus(
  person: Tables['missing_persons']['Insert'],
  statusUpdate: Omit<Tables['status_updates']['Insert'], 'person_id' | 'status_id'> & {
    net_id?: string | null;
    frequency?: string | null;
  },
  statusId: string
) {
  // Ensure we have an event_id
  if (!person.event_id) {
    person.event_id = await ensureDefaultEvent();
  }

  // Start a transaction by using the same timestamp
  const timestamp = new Date().toISOString();

  // First create the missing person with the initial status
  const { data: missingPerson, error: personError } = await supabase
    .from('missing_persons')
    .insert({
      ...person,
      current_status_id: statusId,
      created_at: timestamp,
      updated_at: timestamp
    })
    .select()
    .single();

  if (personError) throw personError;
  if (!missingPerson) throw new Error('No data returned from missing person creation');

  // Then create the initial status update
  const { error: updateError } = await supabase
    .from('status_updates')
    .insert({
      ...statusUpdate,
      person_id: missingPerson.id,
      status_id: statusId,
      created_at: timestamp
    });

  if (updateError) throw updateError;

  // Update statistics
  await supabase.rpc('increment_total_searches');

  // Fetch the complete record with all relations
  const { data: completeRecord, error: fetchError } = await supabase
    .from('missing_persons')
    .select(`
      *,
      status_updates (
        id,
        status_id,
        address,
        last_city,
        last_state,
        zip,
        last_seen_date,
        notes,
        case_closed,
        created_at,
        net_id,
        frequency,
        status_types:status_id (
          name
        )
      )
    `)
    .eq('id', missingPerson.id)
    .single();

  if (fetchError) throw fetchError;
  if (!completeRecord) throw new Error('Failed to fetch complete record');

  return completeRecord;
}

export async function createStatusUpdate(update: Tables['status_updates']['Insert'] & {
  net_id?: string | null;
  frequency?: string | null;
}) {
  const { data, error } = await supabase
    .from('status_updates')
    .insert(update)
    .select(`
      id,
      person_id,
      status_id,
      address,
      last_city,
      last_state,
      zip,
      last_seen_date,
      notes,
      case_closed,
      created_at,
      net_id,
      frequency,
      status_types:status_id (
        name
      )
    `)
    .single();

  if (error) throw error;

  // Update statistics if case is closed
  if (update.case_closed) {
    await supabase.rpc('increment_closed_cases');
  }

  return data;
}

export async function updateMissingPerson(
  id: string,
  updates: Tables['missing_persons']['Update']
) {
  const { data, error } = await supabase
    .from('missing_persons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStatusTypes() {
  const { data, error } = await supabase
    .from('status_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getEventUpdates(eventId: string) {
  const { data, error } = await supabase
    .from('event_updates')
    .select(`
      *,
      profiles:created_by (
        first_name,
        last_name
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createEventUpdate(update: Tables['event_updates']['Insert']) {
  const { data, error } = await supabase
    .from('event_updates')
    .insert(update)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNeeds(eventId: string, status?: string) {
  const query = supabase
    .from('needs')
    .select(`
      *,
      profiles:created_by (
        first_name,
        last_name
      ),
      fulfilled_by_profile:fulfilled_by (
        first_name,
        last_name
      )
    `)
    .eq('event_id', eventId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (status) {
    query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createNeed(need: Tables['needs']['Insert']) {
  const { data, error } = await supabase
    .from('needs')
    .insert(need)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNeed(
  id: string,
  updates: Tables['needs']['Update']
) {
  const { data, error } = await supabase
    .from('needs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNeed(id: string) {
  const { error } = await supabase
    .from('needs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      roles:role_id (
        id,
        name,
        description
      )
    `)
    .order('email');

  if (error) throw error;
  return data;
}

export async function getRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getNets() {
  const { data, error } = await supabase
    .from('nets')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createNet(net: Tables['nets']['Insert']) {
  const { data, error } = await supabase
    .from('nets')
    .insert(net)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNet(
  id: string,
  updates: Tables['nets']['Update']
) {
  const { data, error } = await supabase
    .from('nets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNet(id: string) {
  const { error } = await supabase
    .from('nets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}