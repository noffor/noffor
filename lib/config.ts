export const siteConfig = {
  name: 'Noffor',
  defaultCountry: 'qa',
  defaultLanguage: 'en',
  categories: [
    { slug: 'driver', name: 'Driver', icon: '/icons/driver.png', banner: '/banners/driver.jpg' },
    { slug: 'electrician', name: 'Electrician', icon: '/icons/electrician.png', banner: '/banners/electrician.jpg' },
    { slug: 'plumber', name: 'Plumber', icon: '/icons/plumber.png', banner: '/banners/plumber.jpg' },
    { slug: 'mason', name: 'Mason', icon: '/icons/mason.png', banner: '/banners/mason.jpg' },
    { slug: 'ac-technician', name: 'AC Technician', icon: '/icons/ac.png', banner: '/banners/ac.jpg' },
    { slug: 'painter', name: 'Painter', icon: '/icons/painter.png', banner: '/banners/painter.jpg' },
    { slug: 'carpenter', name: 'Carpenter', icon: '/icons/carpenter.png', banner: '/banners/carpenter.jpg' },
    { slug: 'welder', name: 'Welder', icon: '/icons/welder.png', banner: '/banners/welder.jpg' },
    { slug: 'cleaner', name: 'Cleaner', icon: '/icons/cleaner.png', banner: '/banners/cleaner.jpg' },
    { slug: 'cook', name: 'Cook', icon: '/icons/cook.png', banner: '/banners/cook.jpg' },
    { slug: 'helper', name: 'Helper', icon: '/icons/helper.png', banner: '/banners/helper.jpg' },
    { slug: 'gardener', name: 'Gardener', icon: '/icons/gardener.png', banner: '/banners/gardener.jpg' },
  ],
};

export const categories = siteConfig.categories;

export const flags: Record<string, string> = {
  bangladesh: '/flags/bd.svg',
  india: '/flags/in.svg',
  pakistan: '/flags/pk.svg',
  nepal: '/flags/np.svg',
  srilanka: '/flags/lk.svg',
  philippines: '/flags/ph.svg',
  egypt: '/flags/eg.svg',
};