<script>
  import {
    Minimize2, X, ExternalLink, Calendar,
    Code, Users, Wrench, Sticker,
    Youtube, Github, Mail, Building2,
    VenetianMask, Bike, Twitter, Linkedin,
  } from 'lucide-svelte';

  import { onMount } from 'svelte';

  let currentTime = $state(new Date().toLocaleString());
  let isMinimized = $state(false);

  setInterval(() => {
    currentTime = new Date().toLocaleString();
  }, 60000);

  // get last updated from git commit date
  // https://github.com/WhiskeyTuesday/elijasorensendotcom/commits/master/
  let lastUpdated = $state('Loading...');

  onMount(async () => {
    try {
      const res = await fetch(
        'https://api.github.com/repos/WhiskeyTuesday/elijasorensendotcom/commits/master'
      );
      if (!res.ok) throw new Error('GitHub API request failed');
      const data = await res.json();
      const dateString = data.commit?.committer?.date;
      if (dateString) {
        const date = new Date(dateString);
        lastUpdated = new Date(dateString).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (e) {
      console.error('Error fetching last updated date:', e);
      lastUpdated = 'Unavailable';
    }
  });

  const socialLinks = [
    {
      title: "Twitter",
      handle: "@whiskeytuesday",
      description: "I tweet sometimes",
      icon: Twitter,
      color: "bg-sky-400",
      borderColor: "border-sky-600",
      link: "https://twitter.com/whiskeytuesday",
    },
    {
      title: "GitHub",
      handle: "whiskeytuesday",
      description: "all of my impressive code is in private repos",
      icon: Github,
      color: "bg-gray-400",
      borderColor: "border-gray-600",
      link: "https://github.com/whiskeytuesday"
    },
    {
      title: "LinkedIn",
      handle: "elija-sorensen",
      description: "I still don't know what this is for",
      icon: Linkedin,
      color: "bg-blue-400",
      borderColor: "border-blue-600",
      link: "https://linkedin.com/in/elija-sorensen-04a5136b",
    },
    {
      title: "Email",
      handle: "hello@elijasorensen.com",
      description: "the old reliable",
      icon: Mail,
      color: "bg-stone-400",
      borderColor: "border-stone-600",
      link: "mailto:hello@elijasorensen.com",
    }
  ];

  const otherLinks = [
    {
      title: "Strava",
      handle: "whiskeytuesday",
      description: "almost entirely zwift rides",
      icon: Bike,
      color: "bg-red-400",
      borderColor: "border-red-600",
      link: "https://www.strava.com/athletes/42695116",
    },
  ];

  const currentProjects = [
    {
      title: "office hours dot lol",
      description: "illegible tpot meetup directory",
      subtitle: "entirely official and totally legitimate",
      icon: Calendar,
      status: "active",
      link: "https://officehours.lol",
    },
    {
      title: "Thermastrut",
      description: "construction technology",
      subtitle: "might fuck around and change building construction forever idk",
      icon: Wrench,
      status: "patent pending",
      link: "https://thermastrut.com",
    },
    {
      title: "The Lifestyle Computer Company",
      description: "co-founder and technologist",
      subtitle: "a totally real company™",
      icon: Building2,
      status: "consulting",
      color: "bg-pink-400",
      borderColor: "border-pink-600",
      link: "https://lcc.solutions",
    },
    {
      title: "mardicamp",
      description: "it'll change your life",
      subtitle: "come to mardi gras with your weird twitter friends",
      icon: VenetianMask,
      color: "bg-purple-400",
      borderColor: "border-purple-600",
      status: "Signup available soon",
      link: "https://mardi.camp",
    },
  ].map(obj => ({
    ...obj,
    color: obj.color || 'bg-green-400',
    borderColor: obj.borderColor || 'border-green-600',
  }));

  const backburneredProjects = [
    {
      title: "Gather Social",
      description: "fixing dating and human social interaction",
      subtitle: "aren't you tired of online dating?",
      icon: Users,
      status: "ran out of patience",
      link: "#"
    },
    {
      title: "Stickers and Shirts",
      description: "design and merch",
      subtitle: "I took them down because redbubble only uses paypal and I hate paypal",
      icon: Sticker,
      status: "pending relaunch",
      link: "#"
    },
    {
      title: "YouTube Videos",
      description: "I used to make videos",
      subtitle: "I took them all down years ago",
      icon: Youtube,
      status: "discontinued",
      link: "#"
    },
    {
      title: "Dumb NFTs",
      description: "I had some ideas. I might still do them",
      subtitle: "I would have made so much money if I had just done it",
      icon: Code,
      status: "maybe",
      link: "#"
    }
  ];

  const miscItems = [
    "Where should I put photos I take? I used to use instagram, flickr, 500px, they all suck",
    "I'm a pretty big airplane and flightsim nerd, I don't think I have any links relevant though",
    "I have a lot of vintage computers in various states of repair",
    "I have a lot of electronics projects in various states of completion",
    "I'm sure I'm forgetting some other things that should be on here",
  ];
</script>

<div class="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-4 font-mono">
  <div class="mx-auto max-w-4xl">
    <!-- Window Frame -->
    <div class="bg-stone-50 border-2 border-stone-400 shadow-lg" class:hidden={isMinimized}>
      <!-- Title Bar -->
      <div class="bg-gradient-to-r from-stone-300 to-stone-400 border-b-2 border-stone-500 px-4 py-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-stone-800 font-bold text-lg">elija sorensen dot com</span>
        </div>
        <div class="flex items-center space-x-1">
          <button
            onclick={() => isMinimized = true}
            class="w-6 h-6 bg-stone-200 border border-stone-400 hover:bg-stone-300 flex items-center justify-center"
          >
            <Minimize2 size={12} />
          </button>
          <button class="w-6 h-6 bg-stone-200 border border-stone-400 hover:bg-stone-300 flex items-center justify-center">
            <!-- TODO: some kind of joke on close... rickroll? -->
            <X size={12} onclick={() => alert("This is me not rickrolling you. You're welcome")} />
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="border-b border-stone-300 pb-4">
          <h1 class="text-2xl font-bold text-stone-800 mb-2">Elija Sorensen</h1>
          <p class="text-stone-600">Technologist, organizer, tinkerer, autodidact</p>
        </div>

        <!-- Social Links -->
        <section>
          <h2 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
            me on the internet
          </h2>
          <div class="space-y-2">
            {#each socialLinks as link}
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                class="block bg-stone-100 border-2 border-stone-400 p-3 hover:bg-stone-50 transition-colors group"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-2 flex-shrink-0">
                    <div class="w-3 h-3 {link.color} border {link.borderColor}"></div>
                    <link.icon size={16} class="text-stone-600 group-hover:text-stone-800" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline space-x-2">
                      <span class="font-bold text-stone-800">{link.title}</span>
                      <span class="text-sm text-stone-600 font-mono">{link.handle}</span>
                    </div>
                    <p class="text-xs text-stone-500 italic">{link.description}</p>
                  </div>
                  <ExternalLink size={12} class="text-stone-400 group-hover:text-stone-600 flex-shrink-0" />
                </div>
              </a>
            {/each}
          </div>
        </section>

        <!-- Current Concerns -->
        <section>
          <h2 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
            going concerns
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each currentProjects as project}
                <div class="bg-stone-100 border-2 border-stone-400 p-4 hover:bg-stone-50 transition-colors">
                  <a href={project.link}>
                    <!-- Mini title bar -->
                    <div class="bg-stone-200 border-b border-stone-300 -mx-4 -mt-4 mb-3 px-3 py-1 flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 {project.color} border {project.borderColor}"></div>
                        <span class="text-xs text-stone-600">{project.status}</span>
                      </div>
                      {#if project.link !== '#'}
                        <ExternalLink size={12} class="text-stone-500" />
                      {/if}
                    </div>
                    <div class="flex items-start space-x-3">
                      <project.icon size={20} class="text-stone-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 class="font-bold text-stone-800">{project.title}</h3>
                        <p class="text-sm text-stone-600 mb-1">{project.description}</p>
                        <p class="text-xs text-stone-500 italic">{project.subtitle}</p>
                      </div>
                    </div>
                  </a>
                </div>
            {/each}
          </div>
        </section>

        <!-- Failed and Backburnered -->
        <section>
          <h2 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
            the backburner
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each backburneredProjects as project}
              <div class="bg-stone-100 border-2 border-stone-400 p-4 hover:bg-stone-50 transition-colors opacity-75">
                <!-- Mini title bar -->
                <div class="bg-stone-200 border-b border-stone-300 -mx-4 -mt-4 mb-3 px-3 py-1 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-stone-400 border border-stone-500"></div>
                    <span class="text-xs text-stone-600">{project.status}</span>
                  </div>
                  {#if project.link !== '#'}
                    <ExternalLink size={12} class="text-stone-500" />
                  {/if}
                </div>
                <div class="flex items-start space-x-3">
                  <project.icon size={16} class="text-stone-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 class="font-bold text-stone-700 text-sm">{project.title}</h3>
                    <p class="text-xs text-stone-600 mb-1">{project.description}</p>
                    <p class="text-xs text-stone-500 italic">{project.subtitle}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>

        <!-- Miscellaneous -->
        <section>
          <h2 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
            also
          </h2>
          <div class="bg-stone-100 border-2 border-stone-400 p-4">
            <ul class="space-y-1">
              {#each miscItems as item}
                <li class="text-sm text-stone-700 flex items-start">
                  <span class="text-stone-500 mr-2">•</span>
                  {item}
                </li>
              {/each}
            </ul>
          </div>
        </section>

        <!-- other links -->
        <section>
          <h2 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
            more of me
          </h2>
          <div class="space-y-2">
            {#each otherLinks as link}
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                class="block bg-stone-100 border-2 border-stone-400 p-3 hover:bg-stone-50 transition-colors group"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-2 flex-shrink-0">
                    <div class="w-3 h-3 {link.color} border {link.borderColor}"></div>
                    <link.icon size={16} class="text-stone-600 group-hover:text-stone-800" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline space-x-2">
                      <span class="font-bold text-stone-800">{link.title}</span>
                      <span class="text-sm text-stone-600 font-mono">{link.handle}</span>
                    </div>
                    <p class="text-xs text-stone-500 italic">{link.description}</p>
                  </div>
                  <ExternalLink size={12} class="text-stone-400 group-hover:text-stone-600 flex-shrink-0" />
                </div>
              </a>
            {/each}
          </div>
        </section>

        <!-- Footer -->
        <div class="border-t border-stone-300 pt-4 flex justify-between items-center text-xs text-stone-500">
          <span>> last updated: {lastUpdated}</span>
          <span>system time: {currentTime}</span>
        </div>
      </div>
    </div>

    <!-- Minimized State -->
    {#if isMinimized}
      <button
        onclick={() => isMinimized = false}
        class="bg-stone-300 border-2 border-stone-400 px-4 py-2 hover:bg-stone-200 transition-colors"
      >
        <span class="font-mono text-sm">elija sorensen dot com</span>
      </button>
    {/if}
  </div>
</div>
