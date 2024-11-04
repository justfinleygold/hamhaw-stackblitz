import { ArrowLeft, Radio, Users, Shield, Heart, Network, CheckCircle, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About HamHAW</h1>
        
        {/* Introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg mb-12">
          <p className="text-lg text-gray-800 leading-relaxed">
            HamHAW (Ham Health and Welfare) is a pioneering platform that bridges the gap between 
            emergency communication and community welfare. By leveraging the extensive ham radio network, 
            we help locate missing persons and coordinate welfare checks during disasters when traditional 
            communication infrastructure fails.
          </p>
        </div>

        {/* Mission and Goals */}
        <section className="mb-12">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <Target className="w-6 h-6 text-primary-500 mr-2" />
            Our Mission and Goals
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="mb-4">
              Our mission is to provide emergency communications support to the public so those inside an emergency area can communicate their status and needs to authorities and the public at large. We strive to:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                <span>Provide rapid response capabilities for locating missing persons during disasters</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                <span>Coordinate welfare checks when normal communication channels are disrupted</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                <span>Build a resilient network of trained ham radio operators ready to serve</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                <span>Connect families with their loved ones during critical situations</span>
              </li>
            </ul>
          </div>
        </section>

        {/* How We Got Started */}
        <section className="mb-12">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <Radio className="w-6 h-6 text-primary-500 mr-2" />
            How We Got Started
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="mb-4">
              HamHAW was born from the experiences of ham radio operators during Hurricane Helene in the North Carolina mountains. 
              When all other forms of communication failed, amateur radio remained operational, 
              becoming a lifeline for countless families seeking information about their loved ones.
            </p>
            <p className="mb-4">
              A group of dedicated ham operators recognized the need for a more organized system to 
              handle missing person reports and welfare checks during disasters. This led to the 
              development of HamHAW, combining the reliability of ham radio with modern digital 
              tools to create a comprehensive emergency response platform.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <Network className="w-6 h-6 text-primary-500 mr-2" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">For Communities</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact your local ham radio operator</li>
                <li>Provide details about missing persons</li>
                <li>Receive updates through the ham network</li>
                <li>Access real-time status through our platform</li>
              </ol>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">For Ham Operators</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Register as a verified operator</li>
                <li>Monitor emergency frequencies</li>
                <li>Log and update cases in real-time</li>
                <li>Coordinate with other operators</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="mb-12">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <Users className="w-6 h-6 text-primary-500 mr-2" />
            Who We Are
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="mb-4">
              Our team consists of experienced ham radio operators, net controllers, 
              and software developers. We are united by our commitment to public service and our 
              belief in the vital role that amateur radio plays in emergency communications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <Radio className="w-8 h-8 text-primary-500" />
                </div>
                <h4 className="font-semibold mb-2">Ham Operators</h4>
                <p className="text-sm text-gray-600">Licensed amateur radio experts providing emergency communications</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <Network className="w-8 h-8 text-primary-500" />
                </div>
                <h4 className="font-semibold mb-2">Net Controllers</h4>
                <p className="text-sm text-gray-600">Radio operators specializing in leading on-the-air organized events</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8 text-primary-500" />
                </div>
                <h4 className="font-semibold mb-2">Community Volunteers</h4>
                <p className="text-sm text-gray-600">Dedicated individuals supporting local response efforts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Network</h2>
          <p className="text-lg text-gray-700 mb-6">
            Whether you're a licensed ham operator or someone interested in emergency communications, 
            we welcome you to join our growing network of volunteers.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}