export default function UserPrivacy() {
  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">

      <div className="max-w-4xl mx-auto p-4 md:p-6">

        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Privacy Policy
        </h1>

        <div className="bg-white rounded-xl shadow p-5 space-y-6 text-textSub text-sm leading-relaxed">

          <p>
            We value your privacy and are committed to protecting your personal information.
          </p>

          <div>
            <h3 className="font-semibold text-black">Information We Collect</h3>
            <p>
              We collect basic details such as your name, email address, and mobile number for account creation and communication.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">How We Use Your Data</h3>
            <p>
              Your data is used to manage your account, process payments, and improve our services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">Data Security</h3>
            <p>
              We take appropriate measures to protect your data from unauthorized access.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">Third-Party Sharing</h3>
            <p>
              We do not sell or share your personal data with third parties except for payment processing and service improvement.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">User Consent</h3>
            <p>
              By using our platform, you agree to our privacy policy and terms.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}