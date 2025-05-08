import Link from 'next/link'
import AnimatedHashtag from '@/components/AnimatedHashtag'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#13294B] sm:text-6xl">
            Find Your Perfect Study Partner
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with fellow UIUC students taking the same courses as you. Form study groups, share resources, and ace your classes together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/courses"
              className="rounded-md bg-[#E84A27] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#D73D1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
            >
              Get Started
            </Link>
            <Link href="/matches" className="text-sm font-semibold leading-6 text-[#13294B]">
              View Matches <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-8">
            <AnimatedHashtag />
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#E84A27]">Better Together</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#13294B] sm:text-4xl">
            Everything you need to succeed in your courses
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-[#13294B]">
                Course Matching
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Add your current courses and get matched with other students taking the same classes.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-[#13294B]">
                Study Groups
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Form study groups with your matches to prepare for exams and work on assignments together.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-[#13294B]">
                Resource Sharing
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Share study materials, notes, and helpful resources with your study partners.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
