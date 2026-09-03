/* Core site model. Themes never live here. */
window.SITE = {
  person: {
    name: "Harris Kenny"
  },
  apps: [
    {
      id: "harris",
      name: "About Me",
      windowTitle: "About Me",
      kind: "about",
      body: [
        "My name is Harris Kenny, I'm the founder of OutboundSync and I contribute to Omarchy Kids. I'm based in Denver, Colorado, USA. I'm Christian, husband and father to three awesome kids.",
        "I've lived a lot of my life on computers, this site is a tribute to that journey over the years. Thanks to my parents for letting me learn how they work. And thank you for stopping by!"
      ]
    },
    {
      id: "outboundsync",
      name: "OutboundSync",
      windowTitle: "OutboundSync",
      kind: "link",
      blurb: "I founded OutboundSync in 2024, spun out of my go to market agency Kenny Consulting Group. After a few failed SaaS ideas, we landed here and the rest is history.",
      action: { label: "Learn more about OutboundSync", href: "https://outboundsync.com/" }
    },
    {
      id: "omarchy",
      name: "Omarchy",
      windowTitle: "Omarchy Kids",
      kind: "folder",
      kids: {
        title: "Omarchy Kids",
        blurb: "I contribute to Omarchy Linux, a beautiful, fun, agentic Linux distribution by DHH. I help with the Omarchy Kids project and maintain several plugins, including:",
        action: { label: "Learn more about Omarchy", href: "https://omarchy.org/" }
      },
      items: [
        { id: "sparklekeys", name: "Sparklekeys", blurb: "a typing hunt in the Kids category", href: "https://github.com/kenhara/omarchy-sparklekeys" },
        { id: "rocketlauncher", name: "Rocketlauncher", blurb: "next launch on the bar", href: "https://github.com/kenhara/omarchy-rocketlauncher" },
        { id: "compliantish", name: "Compliantish", blurb: "quiet checks on the machine", href: "https://github.com/kenhara/omarchy-compliantish" },
        { id: "enricherino", name: "Enricherino", blurb: "look someone up from the bar", href: "https://github.com/kenhara/omarchy-enricherino" },
        { id: "encyclopedic", name: "Encyclopedic", blurb: "search from the bar", href: "https://github.com/kenhara/omarchy-encyclopedic" },
        { id: "scriptural", name: "Scriptural", blurb: "Bible verse of the day", href: "https://github.com/kenhara/omarchy-scriptural" }
      ]
    },
    {
      id: "github",
      name: "GitHub",
      windowTitle: "GitHub",
      kind: "link",
      blurb: "My personal GitHub handle is kenhara and in this repository you can find open source projects I'm working on.",
      action: { label: "Visit my GitHub repo", href: "https://github.com/kenhara" }
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      windowTitle: "LinkedIn",
      kind: "link",
      blurb: "I'm active on LinkedIn, where you can find me posting about sales, marketing, and go to market.",
      action: { label: "Visit my LinkedIn profile", href: "https://www.linkedin.com/in/harriskenny/" }
    },
    {
      id: "x",
      name: "X",
      windowTitle: "X",
      kind: "link",
      blurb: "I'm active on X @harriskennyx, where you can find me posting about Omarchy and running OutboundSync.",
      action: { label: "Visit my X profile", href: "https://x.com/harriskennyx" }
    }
  ],
  eras: [
    { id: "dos",     name: "DOS",            short: "DOS" },
    { id: "win31",   name: "Windows 3.1",    short: "3.1" },
    { id: "win95",   name: "Windows 95",     short: "95" },
    { id: "mac8",    name: "Mac OS 8",       short: "OS 8" },
    { id: "osx",     name: "Mac OS X",       short: "OS X" },
    { id: "xfce",    name: "Debian",         short: "Debian" },
    { id: "popos",   name: "Pop!_OS",        short: "Pop!_OS" },
    { id: "macos",   name: "MacOS",          short: "MacOS" },
    { id: "omarchy", name: "Omarchy",        short: "Omarchy" }
  ],
  defaultEra: "omarchy"
};
