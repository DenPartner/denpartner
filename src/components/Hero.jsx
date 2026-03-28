import { Link } from "react-router-dom";
export default function Hero() {
  return (
    <div className="pt-8  px-4 md:px-6 bg-gradient-to-b from-[#F8F5F0] to-white">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>

          <h1 className="text-3xl md:text-6xl font-bold leading-tight text-textMain">
            Earn Money Online <br />

            <span className="text-primary">
              with Affiliate Marketing
            </span>
          </h1>

          <p className="mt-4 text-textSub text-sm md:text-lg max-w-lg">
            Share top deals and earn commission on every sale. 
            Work from home and build passive income easily.
          </p>

          {/* POINTS */}
          <div className="mt-5 space-y-2 text-sm md:text-base text-textSub">
            <p>✔ Flipkart, Amazon & more</p>
            <p>✔ Work from home flexibility</p>
            <p>✔ No investment required</p>
          </div>

          {/* BUTTON */}
          <div className="mt-6">
          
              <Link
  to="/login"
  className="bg-gold text-black px-6 py-3 rounded-md font-semibold shadow hover:opacity-90 transition inline-block"
>
  Start Earning Now
</Link>
            
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center">
          <img
            src="/hero.png"
            alt="Hero"
            className="w-[250px] md:w-[420px] object-contain"
          />
        </div>

      </div>

    </div>
  );
}