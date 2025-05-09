'use client'

import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AnimatedHashtag from '@/components/AnimatedHashtag'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/matches")
    } else {
      signIn("google", { callbackUrl: "/matches" })
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Never Study Alone at <span className="bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent">UIUC</span>
          </h1>
          <div className="mt-6 space-y-2">
            <motion.p 
              className="text-2xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unlock peer power no platform offers
            </motion.p>
            <motion.p 
              className="text-2xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              so you conquer courses only <span className="bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent">Illini</span> can
            </motion.p>
          </div>
          <motion.div 
            className="mt-10 flex items-center justify-center gap-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              onClick={handleGetStarted}
              className="rounded-md bg-[#E84A27] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#D73D1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
            >
              Get Matched Now
            </button>
            {status === "authenticated" && (
              <Link href="/matches" className="text-sm font-semibold leading-6 text-white hover:text-[#E84A27] transition-colors">
                View Matches <span aria-hidden="true">→</span>
              </Link>
            )}
          </motion.div>
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <AnimatedHashtag />
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        className="mx-auto max-w-7xl px-6 pb-12 sm:pb-16 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent">Join 5,000+ Illini Already Syncing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to succeed in your courses
          </p>
        </div>
        <motion.div 
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <motion.div 
              className="flex flex-col p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-4">
                Course Matching
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-white">
                <p className="flex-auto">
                  Instantly connect with peers in your current classes (MATH 231, CS 225, CHEM 102...)
                </p>
              </dd>
            </motion.div>
            <motion.div 
              className="flex flex-col p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-4">
                Study Squads
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-white">
                <p className="flex-auto">
                  Create or join groups for projects, exam prep, or homework help
                </p>
              </dd>
            </motion.div>
            <motion.div 
              className="flex flex-col p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-4">
                Crowdsourced Notes
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-white">
                <p className="flex-auto">
                  Share/access study guides, past exams, and cheat sheets
                </p>
              </dd>
            </motion.div>
          </dl>
        </motion.div>
      </motion.div>
    </div>
  )
}
