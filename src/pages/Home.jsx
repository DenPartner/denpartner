
import Hero from "../components/Hero";
import Footer from "../components/Footer";
  import { User, Share2, BarChart3, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-bg text-textMain">
    
      {/* HERO */}
      <Hero />
     

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">

        <div className="bg-[#F8F5F0] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <img
            src="/features/high-commission.png"
            className="h-28 mx-auto mb-6"
          />
          <h3 className="text-xl font-semibold mb-2">High Commissions</h3>
          <p className="text-textSub text-sm">
            Earn top commissions on every sale you generate.
          </p>
        </div>

        <div className="bg-[#F8F5F0] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <img
            src="/features/easy-withdrawal.png"
            className="h-28 mx-auto mb-6"
          />
          <h3 className="text-xl font-semibold mb-2">Easy Withdrawals</h3>
          <p className="text-textSub text-sm">
            Withdraw your earnings quickly and securely.
          </p>
        </div>

        <div className="bg-[#F8F5F0] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <img
            src="/features/work-from-home.png"
            className="h-28 mx-auto mb-6"
          />
          <h3 className="text-xl font-semibold mb-2">Work From Home</h3>
          <p className="text-textSub text-sm">
            Earn money anytime from the comfort of your home.
          </p>
        </div>

      </section>

    
     {/* HOW IT WORKS */}
<section id="how" className="bg-white py-20">

  <div  className="max-w-7xl mx-auto px-6 text-center">

    {/* TITLE */}
    <h2 className="text-3xl font-bold text-textMain mb-2">
      How It Works
    </h2>

    <p className="text-sm text-textSub mb-12">
      Simple Steps to Start Earning
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

      {/* CARD 1 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="bg-primary text-white py-4 font-semibold">
          1. Join Platform
        </div>

        <div className="-mt-3 flex justify-center">
          <div className="bg-gold p-3 rounded-full shadow">
            <User className="text-black w-5 h-5" />
          </div>
        </div>

        <div className="p-5 text-black">
          <p className="text-sm text-textSub">
            Sign up & get access to top offers
          </p>
        </div>

      </div>

      {/* CARD 2 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="bg-primary text-white py-4 font-semibold">
          2. Share Links
        </div>

        <div className="-mt-3 flex justify-center">
          <div className="bg-gold p-3 rounded-full shadow">
            <Share2 className="text-black w-5 h-5" />
          </div>
        </div>

        <div className="p-5 text-black">
          <p className="text-sm text-textSub">
            Promote deals on social media
          </p>
        </div>

      </div>

      {/* CARD 3 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="bg-primary text-white py-4 font-semibold">
          3. Track Earnings
        </div>

        <div className="-mt-3 flex justify-center">
          <div className="bg-gold p-3 rounded-full shadow">
            <BarChart3 className="text-black w-5 h-5" />
          </div>
        </div>

        <div className="p-5 text-black">
          <p className="text-sm text-textSub">
            Monitor your sales & commissions
          </p>
        </div>

      </div>

      {/* CARD 4 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="bg-primary text-white py-4 font-semibold">
          4. Get Paid
        </div>

        <div className="-mt-3 flex justify-center">
          <div className="bg-gold p-3 rounded-full shadow">
            <Wallet className="text-black w-5 h-5" />
          </div>
        </div>

        <div className="p-5 text-black">
          <p className="text-sm text-textSub">
            Withdraw earnings easily
          </p>
        </div>

      </div>

    </div>

  </div>

</section>

  {/* BRANDS */}
  <section className="bg-[#F8F5F0] py-16">
  <div className="max-w-7xl mx-auto px-6 text-center">

    <h2 className="text-2xl font-semibold mb-10 text-textMain">
      Top Brands
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <img src="/brands/flipkart.png" className="h-30 mx-auto" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <img src="/brands/amazon.png" className="h-30 mx-auto" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <img src="/brands/myntra.png" className="h-30 mx-auto" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <img src="/brands/ajio.png" className="h-30 mx-auto" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <img src="/brands/tata.png" className="h-30 mx-auto" />
      </div>

    </div>

  </div>
</section>
      

      {/* TESTIMONIALS */}
      {/* SUCCESS STORIES */}
<section className="bg-white py-16">

  <div className="max-w-7xl mx-auto px-6">

    {/* TITLE */}
    <h2 className="text-3xl font-bold text-center text-textMain mb-12">
      Success Stories
    </h2>

    {/* GRID */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* CARD 1 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">

        {/* USER */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-bold">
            S
          </div>
          <div>
            <h4 className="font-semibold">Sumanth</h4>
            <p className="text-xs text-textSub">Verified User</p>
          </div>
        </div>

        {/* STARS */}
        <div className="text-gold text-sm mb-3">
          ★★★★★
        </div>

        {/* TEXT */}
        <p className="text-textSub text-sm leading-relaxed">
          "I earn extra income easily from home. Amazing platform!"
        </p>

      </div>

      {/* CARD 2 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-bold">
            E
          </div>
          <div>
            <h4 className="font-semibold">Eswar</h4>
            <p className="text-xs text-textSub">Verified User</p>
          </div>
        </div>

        <div className="text-gold text-sm mb-3">
          ★★★★★
        </div>

        <p className="text-textSub text-sm leading-relaxed">
          "Great way to make money online. Highly recommended."
        </p>

      </div>

      {/* CARD 3 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-bold">
            N
          </div>
          <div>
            <h4 className="font-semibold">Sindhuja</h4>
            <p className="text-xs text-textSub">Verified User</p>
          </div>
        </div>

        <div className="text-gold text-sm mb-3">
          ★★★★★
        </div>

        <p className="text-textSub text-sm leading-relaxed">
          "Perfect for housewives to earn in free time."
        </p>

      </div>

    </div>

  </div>

</section>
{/* FOOTER */}
      <Footer />
    </div>
  );
}