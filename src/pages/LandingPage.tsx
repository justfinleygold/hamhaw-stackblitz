import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Radio, Users, ClipboardList, Network } from 'lucide-react';
import { images } from '../assets/images';
import { StatsSection } from '../components/StatsSection';
import { EventNews } from '../components/EventNews';
import { NeedsSection } from '../components/Needs/NeedsSection';
import { EventSelector } from '../components/EventSelector';

export function LandingPage() {
  const navigate = useNavigate();
  const [bannerError, setBannerError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Banner Section */}
      <div className="w-full bg-primary-500">
        {!bannerError ? (
          <img
            src={images.banner}
            alt="HamHAW Banner"
            className="w-full h-[200px] object-cover"
            onError={() => setBannerError(true)}
          />
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <h2 className="text-white text-2xl font-bold">
              Ham Health and Welfare
            </h2>
          </div>
        )}
      </div>

      {/* Event Selector */}
      <EventSelector />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Ham Health and Welfare</span>
            <span className="block text-primary-500">
              Missing Persons Registry
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Locate and help individuals in emergency situations through our
            community-driven search platform.
          </p>

          <div className="mt-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 md:text-lg transition-colors duration-150 ease-in-out shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Missing Persons
            </button>
          </div>
        </div>

        {/* Event News Section */}
        <div className="mt-16">
          <EventNews />
        </div>

        {/* Needs Section */}
        <div className="mt-16">
          <NeedsSection />
        </div>

        {/* Stats Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Impact
          </h2>
          <StatsSection />
        </div>

        {/* How it Works Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Radio className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Contact</h3>
              <p className="text-gray-600">
                Local residents contact their nearby ham radio operator to
                report missing persons or request welfare checks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Network className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ham Network</h3>
              <p className="text-gray-600">
                Local operators broadcast requests to the wider ham radio
                network, reaching operators in affected areas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">System Logging</h3>
              <p className="text-gray-600">
                Remote operators use HamHAW to log missing persons and update
                their status as information becomes available.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Public Access</h3>
              <p className="text-gray-600">
                Family and friends can search the registry and submit new
                missing person reports for ham operators to investigate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
