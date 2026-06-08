/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['googleapis', 'google-auth-library'],

  async redirects() {
    return [
      // Season Plan (replaces Tri Plan + Stretch Goals)
      { source: '/tri-plan', destination: '/season-plan', permanent: true },
      { source: '/stretch-goals', destination: '/season-plan', permanent: true },
      // Training Log (replaces Workouts + Progress)
      { source: '/workouts', destination: '/training-log', permanent: true },
      { source: '/progress', destination: '/training-log', permanent: true },
      // Fuel (replaces Nutrition + Supplements + Meal Hub)
      { source: '/nutrition', destination: '/fuel', permanent: true },
      { source: '/supplements', destination: '/fuel', permanent: true },
      { source: '/meal-hub', destination: '/fuel', permanent: true },
      // Schedule → Dashboard
      { source: '/schedule', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig
