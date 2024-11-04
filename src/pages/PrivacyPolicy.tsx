import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
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
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Information We Collect</h2>
        <p>
          HamHAW collects information that you provide directly to us when you:
        </p>
        <ul>
          <li>Create an account</li>
          <li>Submit missing person reports</li>
          <li>Update status information</li>
          <li>Volunteer as a ham radio operator</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Facilitate missing person searches</li>
          <li>Coordinate emergency response efforts</li>
          <li>Communicate with volunteers and users</li>
          <li>Improve our services</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We share information only:
        </p>
        <ul>
          <li>With emergency responders and authorized volunteers</li>
          <li>When required by law</li>
          <li>With your explicit consent</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal
          information. However, no method of transmission over the Internet is
          100% secure.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of communications</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          For questions about this privacy policy or our practices, please contact
          us at privacy@hamhaw.org.
        </p>
      </div>
    </div>
  );
}