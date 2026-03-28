export default function UserAbout() {
  return (
    <div className="bg-[#F3F4F6] min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6">
          About DenPartner
        </h1>

        <div className="bg-white rounded-xl shadow p-5 space-y-4 text-sm leading-relaxed">
          <p className="text-textSub">
            DenPartner is an affiliate marketing and referral platform designed
            to help users earn commission income by sharing verified campaigns,
            offers, and product links.
          </p>

          <p className="text-textSub">
            Our mission is to empower students, housewives, employees, and
            anyone looking for extra income to earn from home without any
            investment.
          </p>

          <p className="text-textSub">
            We connect brands with promoters and reward users for every valid
            sale, signup, or conversion generated through their referral links.
          </p>

          <p className="text-textSub">
            With DenPartner, online earning becomes simple, flexible, and
            scalable.
          </p>
        </div>
      </div>
    </div>
  );
}