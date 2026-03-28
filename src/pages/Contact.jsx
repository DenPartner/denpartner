import React from "react";
import { Mail, Instagram, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#F8F5F0] px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Contact Us
        </h1>

        <p className="text-gray-600 text-center mb-10">
          We’re here to help you with any questions, support, or partnership
          queries related to DenPartner.
        </p>

        <div className="space-y-6">
          {/* Email */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Email Support</p>
              <a
                href="mailto:support@denpartner.com"
                className="text-gray-600 hover:text-blue-600 break-all"
              >
                support@denpartner.com
              </a>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
            <Instagram className="w-6 h-6 text-pink-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Instagram</p>
              <a
                href="https://www.instagram.com/denpartnerdotcom?igsh=OWJmdzBpdWRtNjNq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 break-all"
              >
                @denpartnerdotcom
              </a>
            </div>
          </div>

          {/* Support Hours */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
            <Phone className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Support Hours</p>
              <p className="text-gray-600">
                Monday - Saturday | 10 AM - 7 PM
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          We usually respond within 24 hours.
        </div>
      </div>
    </div>
  );
};

export default Contact;