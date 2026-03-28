// src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faLocationDot,
  faArrowRight,
  faShieldHalved,
  faBoltLightning,
  faTag,
  faCircleCheck,
  faCalendarCheck,
  faCheck,
  faFileLines,
  faUserTie,
  faCouch,
  faCalendarPlus,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const navigate = useNavigate();
  const [searchError, setSearchError] = useState("");

  const handleSearch = (e) => {
  e.preventDefault();
  setSearchError("");

  const formData = new FormData(e.target);
  const service = formData.get("service")?.trim();
  const location = formData.get("location")?.trim() || "";

  if (!service) {
    setSearchError("Please enter the service you need (required)");
    return;
  }

  const query = new URLSearchParams();

  // ✅ NO manual encoding
  query.set("service", service);
  if (location) query.set("location", location);

  navigate(`/search?${query.toString()}`);
};

  return (
    <main className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-[#003459]/20 selection:text-[#00171F] pt-20">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[40%] h-[50%] bg-gradient-to-br from-[#003459]/20 to-[#00171F]/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/4 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[45%] h-[60%] bg-gradient-to-tl from-[#00171F]/10 to-[#003459]/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/3 animate-blob"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-[#003459]/20 shadow-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#003459] opacity-50"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#003459]"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">Over 5,000 verified professionals available</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#00171F] leading-tight mb-8 animate-fade-in-up animation-delay-100">
            Connect with trusted local<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#00171F] via-[#003459] to-[#00171F] bg-clip-text text-transparent">
              service professionals
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
            Instant quotes • Clear pricing • Verified experts • Guaranteed satisfaction
          </p>

          {/* Search form */}
          <div className="max-w-4xl mx-auto relative group animate-fade-in-up animation-delay-300">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00171F] via-[#003459] to-[#00171F] rounded-3xl opacity-15 group-hover:opacity-30 blur-xl transition duration-500"></div>

            <form onSubmit={handleSearch} className="relative bg-white rounded-3xl p-3 sm:p-4 shadow-xl ring-1 ring-gray-200/60 backdrop-blur-sm">
              {searchError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center text-sm">
                  {searchError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                {/* Required: Service */}
                <div className="flex-1 flex items-center px-5 sm:px-7 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[#003459] text-xl mr-4" />
                  <input
                    type="text"
                    name="service"
                    placeholder="What service do you need? (required)"
                    className="w-full bg-transparent outline-none text-[#00171F] placeholder-gray-500 text-base sm:text-lg font-medium"
                    required
                  />
                </div>

                {/* Optional: Location */}
                <div className="flex-1 flex items-center px-5 sm:px-7 py-4">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#003459] text-xl mr-4" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Your city or PIN code (optional)"
                    className="w-full bg-transparent outline-none text-[#00171F] placeholder-gray-500 text-base sm:text-lg font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="m-1 px-8 sm:px-10 py-4 bg-gradient-to-r from-[#00171F] to-[#003459] hover:from-[#000f14] hover:to-[#002b47] text-white rounded-2xl font-semibold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-[#00171F]/30 flex items-center justify-center gap-2.5"
                >
                  <span>Find Professionals</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 relative z-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-[#00171F] mb-4">
              Why customers choose <span className="text-[#003459]">SmartService</span>
            </h2>
            <p className="text-lg text-gray-600">Reliable, transparent, and efficient service matching with no hidden costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verified Professionals */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-[#003459]/10 hover:shadow-2xl hover:shadow-[#003459]/20 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#003459]/10 to-[#00171F]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#00171F] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 rotate-3 shadow-lg shadow-[#00171F]/30">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <h3 className="text-2xl font-bold text-[#00171F] mb-3">Thoroughly Verified Professionals</h3>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Every professional undergoes identity verification, background checks, and skill assessments before being approved to provide quotes.
                </p>
              </div>
            </div>

            {/* Instant Matching */}
            <div className="bg-gradient-to-br from-[#003459] to-[#00171F] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-[#00171F]/30 transition duration-300 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl mb-5">
                  <FontAwesomeIcon icon={faBoltLightning} />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Matching</h3>
                <p className="text-gray-100 text-sm">Connect with available professionals in under 60 seconds.</p>
              </div>
              <div className="mt-6 text-sm font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-[#00171F] transition cursor-pointer">
                Find a professional <FontAwesomeIcon icon={faArrowRight} className="ml-1.5" />
              </div>
            </div>

            {/* Transparent Pricing */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg shadow-gray-100 hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#003459] text-lg mb-4">
                <FontAwesomeIcon icon={faTag} />
              </div>
              <h3 className="text-lg font-bold text-[#00171F] mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">Fixed upfront quotes with no hidden charges.</p>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg shadow-gray-100 hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#003459] text-lg mb-4">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <h3 className="text-lg font-bold text-[#00171F] mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-600 text-sm">We ensure the job meets your expectations or we make it right.</p>
            </div>

            {/* Rating stats */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 flex items-center justify-between border border-gray-200 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-4xl font-extrabold text-[#00171F]">4.9/5</h3>
                <p className="text-gray-600 mt-1">Average rating from over 50,000 completed jobs</p>
              </div>
              <div className="flex -space-x-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-300"></div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-400"></div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-500"></div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-[#00171F] text-white flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual mockup */}
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square bg-gradient-to-tr from-[#003459]/15 to-[#00171F]/10 rounded-[3rem] p-6 relative">
                <div className="absolute inset-4 bg-white rounded-[2rem] shadow-2xl p-5 flex flex-col gap-3">
                  <div className="h-6 w-3/4 bg-gray-100 rounded-lg"></div>
                  <div className="flex gap-3">
                    <div className="h-20 w-full bg-[#003459]/5 rounded-xl border border-[#003459]/10 p-3">
                      <div className="h-2 w-8 bg-[#003459]/30 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-[#003459]/30 rounded"></div>
                    </div>
                    <div className="h-20 w-full bg-gray-50 rounded-xl"></div>
                  </div>
                  <div className="mt-auto bg-gradient-to-r from-[#00171F] to-[#003459] h-10 rounded-xl text-white flex items-center justify-center font-bold">
                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                    Book Now
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                  <div className="bg-[#003459]/10 p-2 rounded-full text-[#003459]">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="font-bold text-[#00171F] text-sm">Professional En Route</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-[#00171F] mb-6">Completed in three steps</h2>
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#003459]/10 text-[#003459] flex items-center justify-center font-bold text-lg group-hover:bg-[#003459] group-hover:text-white transition-colors duration-300">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00171F] mb-1">
                      <FontAwesomeIcon icon={faFileLines} className="mr-2 text-[#003459]" />
                      Describe your requirements
                    </h3>
                    <p className="text-gray-600 text-sm">Specify the service, location, and preferred timing.</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#003459]/10 text-[#003459] flex items-center justify-center font-bold text-lg group-hover:bg-[#003459] group-hover:text-white transition-colors duration-300">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00171F] mb-1">
                      <FontAwesomeIcon icon={faUserTie} className="mr-2 text-[#003459]" />
                      Select your professional
                    </h3>
                    <p className="text-gray-600 text-sm">Review profiles, ratings, and quotes to choose the best fit.</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#003459]/10 text-[#003459] flex items-center justify-center font-bold text-lg group-hover:bg-[#003459] group-hover:text-white transition-colors duration-300">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00171F] mb-1">
                      <FontAwesomeIcon icon={faCouch} className="mr-2 text-[#003459]" />
                      Job completed
                    </h3>
                    <p className="text-gray-600 text-sm">Pay securely only after the work is completed to your satisfaction.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-center text-3xl font-bold text-[#00171F] mb-12">Trusted by customers and professionals</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
              <div className="absolute -top-4 left-6 text-6xl text-[#003459]/15 font-serif opacity-60">"</div>
              <p className="text-gray-700 italic mb-5 relative z-10 pt-2 text-sm">
                The electrician was highly professional and respectful of our home. Payment through the platform was seamless.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00171F] flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <div className="font-bold text-[#00171F] text-sm">Rahul K.</div>
                  <div className="text-xs text-gray-500">Bangalore • Electrical Repair</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative mt-0 md:-mt-4">
              <div className="absolute -top-4 left-6 text-6xl text-[#003459]/15 font-serif opacity-60">"</div>
              <p className="text-gray-700 italic mb-5 relative z-10 pt-2 text-sm">
                SmartService delivered transparent pricing and excellent workmanship for my car service.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#003459] flex items-center justify-center text-white font-bold">P</div>
                <div>
                  <div className="font-bold text-[#00171F] text-sm">Priya M.</div>
                  <div className="text-xs text-gray-500">Delhi • Vehicle Service</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
              <div className="absolute -top-4 left-6 text-6xl text-[#003459]/15 font-serif opacity-60">"</div>
              <p className="text-gray-700 italic mb-5 relative z-10 pt-2 text-sm">
                As a service provider, SmartService has significantly grown my client base with reliable leads and excellent support.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00171F] flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="font-bold text-[#00171F] text-sm">Anil S.</div>
                  <div className="text-xs text-gray-500">Plumbing Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#00171F] mb-5">
            Ready to book a service?
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of satisfied customers and verified professionals today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#00171F] to-[#003459] text-white font-bold rounded-full hover:from-[#000f14] hover:to-[#002b47] transition duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-[#00171F]/30"
            >
              <FontAwesomeIcon icon={faCalendarPlus} />
              Book a Service
            </a>
            <a
              href="/provider/register"
              className="px-8 py-4 bg-transparent border-2 border-[#00171F] text-[#00171F] font-bold rounded-full hover:bg-[#00171F]/5 hover:border-[#003459] hover:text-[#003459] transition duration-300 flex items-center justify-center gap-3"
            >
              <FontAwesomeIcon icon={faUserPlus} />
              Join as a Professional
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}