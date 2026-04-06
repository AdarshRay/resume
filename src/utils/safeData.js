let _nextExpId = 1;

export default function safe(input) {
  const d = (input && typeof input === "object") ? input : {};
  const s = (v, fb) => (typeof v === "string" && v.length > 0) ? v : (fb || "");
  const a = (v) => Array.isArray(v) ? v : [];
  return {
    name: s(d.name, "Your Name"),
    title: s(d.title, "Professional Title"),
    email: s(d.email, ""),
    phone: s(d.phone, ""),
    location: s(d.location, ""),
    summary: s(d.summary, "Professional summary."),
    experience: a(d.experience).map((e) => ({
      _id: e?._id || `e${_nextExpId++}`,
      role: s(e?.role, "Role"), company: s(e?.company, "Company"),
      period: s(e?.period, "Date"),
      client: s(e?.client, ""),
      location: s(e?.location, ""),
      bullets: a(e?.bullets).map(b => s(b, "Achievement")),
      sections: a(e?.sections).map((section) => ({
        heading: s(section?.heading, "Subsection"),
        bullets: a(section?.bullets).map((b) => s(b, "Achievement")),
      })),
    })),
    skills: a(d.skills).map(sk => s(sk, "Skill")),
    education: a(d.education).map(e => ({
      degree: s(e?.degree, "Degree"), school: s(e?.school, "School"), year: s(e?.year, "Year")
    })),
    certifications: a(d.certifications).filter(c => typeof c === "string" && c),
    customSections: a(d.customSections).filter(x => x && typeof x === "object"),
  };
}
