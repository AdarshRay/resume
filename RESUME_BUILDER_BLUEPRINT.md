# RESUME BUILDER - COMPLETE PROJECT BLUEPRINT
# Give this file to Claude Code with the command at the bottom

## PROJECT STRUCTURE
```
resume-builder/
├── CLAUDE.md
├── package.json
├── vite.config.js
├── index.html
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── utils/
│   │   ├── safeData.js          # Null-safe data defaults
│   │   ├── extractText.js       # PDF/DOCX/TXT extraction
│   │   └── generatePdf.js       # html2canvas + jspdf export
│   ├── components/
│   │   ├── Nav.jsx              # Top nav bar
│   │   ├── EditableText.jsx     # contentEditable inline editor
│   │   ├── PhotoWidget.jsx      # Draggable photo with shapes
│   │   ├── AddButton.jsx        # Green "+ Add" button
│   │   ├── DeleteButton.jsx     # Red "✕" delete button
│   │   ├── A4Wrapper.jsx        # Scaled A4 page container with multi-page
│   │   ├── SectionBlock.jsx     # Draggable section wrapper
│   │   ├── ExpBlock.jsx         # Editable experience block
│   │   ├── SideSection.jsx      # Sidebar section (title + content)
│   │   ├── MainSection.jsx      # Main body section (title + content)
│   │   └── CustomSections.jsx   # Renders custom added sections
│   ├── templates/
│   │   ├── ExecutiveNavy.jsx    # Dark sidebar, gold accents
│   │   ├── ModernBlue.jsx       # Blue sidebar, circular photo
│   │   ├── BoldCoral.jsx        # Diagonal banner top, 2-col body (NO sidebar)
│   │   ├── DevTerminal.jsx      # Dark mode, monospace (NO photo)
│   │   ├── StrategistGold.jsx   # Header strip + cream panel (NO sidebar)
│   │   └── CleanSlate.jsx       # Centered, pure typography (NO photo)
│   ├── panels/
│   │   ├── TemplatePanel.jsx    # Template selector
│   │   ├── PhotoPanel.jsx       # Photo controls + shape picker
│   │   ├── FontPanel.jsx        # Font size + family controls
│   │   ├── ColorPanel.jsx       # Color customizer (5 channels incl background)
│   │   └── SectionPanel.jsx     # Add custom sections
│   └── pages/
│       ├── LandingPage.jsx      # Hero + template previews
│       ├── UploadPage.jsx       # File upload + paste + photo
│       ├── GeneratingPage.jsx   # Progress animation
│       └── EditorPage.jsx       # Left panel + resume preview
```

---

## DESIGN SYSTEM

### Colors
- Background: #08080e
- Surface: rgba(255,255,255,0.02)
- Border: rgba(255,255,255,0.05)
- Text primary: #e0e0e8
- Text secondary: #666
- Text muted: #444
- Accent (green): #00E5A0
- Accent gradient: linear-gradient(135deg, #00E5A0, #00CC8E)
- Error: #F43F5E
- Purple accent: #A78BFA

### Typography
- UI font: 'Outfit', sans-serif (load weights 300-900)
- Resume fonts (load all from Google Fonts):
  - Outfit, Newsreader, JetBrains Mono, Georgia, Playfair Display, Lora, Merriweather, Raleway

### Components Patterns
- Cards: background rgba(255,255,255,0.02), border 1px solid rgba(255,255,255,0.05), border-radius 8px
- Buttons primary: green gradient, color #08080e, font-weight 700, border-radius 10px, box-shadow: 0 0 35px rgba(0,229,160,0.2)
- Buttons secondary: background rgba(255,255,255,0.04), border 1px solid rgba(255,255,255,0.06), color #ddd
- Active/selected states: accent color border + tinted background
- Expandable panels: toggle button + collapsible content div

---

## TEMPLATE DESIGNS (CRITICAL - EACH MUST BE VISUALLY UNIQUE)

### 1. Executive Navy (sidebar template)
- Layout: 240px dark navy (#1B2A4A) sidebar LEFT + white main area RIGHT
- Sidebar: Photo at top (full width or shaped), Contact section with emoji icons, Skills with left border accent, Education, Certifications
- Main: Name in UPPERCASE (26px, 900 weight), Title in gold (#C9A84C), Profile section, Experience with left border
- Accent: Gold #C9A84C

### 2. Modern Blue (sidebar template)
- Layout: 240px blue (#3464A8) sidebar LEFT + white main area RIGHT  
- Sidebar: CIRCULAR photo centered, Name + Title centered below photo, Contact, Skills, Education
- Main: Profile Summary section, Work Experience
- Accent: Blue #3B82F6

### 3. Bold Coral (NO SIDEBAR - completely different layout)
- Layout: Full-width gradient banner at TOP + two-column body below
- Banner: 160px tall, linear-gradient(135deg, #F43F5E, #FB923C), with diagonal white skew at bottom (CSS transform skewY(-3deg))
- Banner content: Photo (shaped) on left + Name/Title/Contact on right, all in white
- Below banner: Two columns - LEFT wider (flex:2) has About Me + Experience, RIGHT narrower (flex:1) has Skills (pill badges) + Education, separated by accent border-left
- Accent: Coral #F43F5E

### 4. Dev Terminal (NO SIDEBAR, NO PHOTO)
- Layout: Full-width dark background (#0f172a), monospace font
- Header: Name (Outfit font for name only), Title in accent blue, contact in gray row
- Sections prefixed with "// SUMMARY", "// EXPERIENCE" etc
- Skills as inline code-style tags with accent background
- Accent: Cyan #38BDF8
- All text in slate gray tones

### 5. Strategist Gold (NO SIDEBAR - different from Executive)
- Layout: Dark header strip at TOP + gold accent line + two-column body
- Header strip: Dark background (#1a1a2e), flex row with Photo (left) + Name/Title (center) + Contact info (right aligned), all in white/gold
- Below header: 4px gold gradient line (left to transparent)
- Body: Two columns - LEFT wider (flex:3) has Profile + Experience, RIGHT narrower (flex:1.2) has cream/beige (#f8f6f0) background rounded card with Skills (gold bullets ▸) + Education
- Accent: Gold #D4A843

### 6. Clean Slate (NO SIDEBAR, NO PHOTO)
- Layout: Full-width white, generous padding (36px 40px)
- Header: Name centered, 28px, font-weight 400, letter-spacing 3px, uppercase, Outfit font
- Title centered, accent color, letter-spacing 3px
- Contact centered row
- Sections with minimal styling, thin gray borders
- Skills as underlined inline text
- Font: Newsreader (serif) for body, Outfit for headings
- Accent: Slate #64748B

---

## KEY UTILITIES

### safeData.js
```javascript
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
    experience: a(d.experience).map(e => ({
      role: s(e?.role, "Role"), company: s(e?.company, "Company"),
      period: s(e?.period, "Date"), bullets: a(e?.bullets).map(b => s(b, "Achievement"))
    })),
    skills: a(d.skills).map(sk => s(sk, "Skill")),
    education: a(d.education).map(e => ({
      degree: s(e?.degree, "Degree"), school: s(e?.school, "School"), year: s(e?.year, "Year")
    })),
    certifications: a(d.certifications).filter(c => typeof c === "string" && c),
    customSections: a(d.customSections).filter(x => x && typeof x === "object"),
  };
}
```

### extractText.js
- Load PDF.js from CDN: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
- Load Mammoth from CDN: https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js
- For .txt/.md: file.text()
- For .pdf: use pdfjsLib.getDocument, iterate pages, getTextContent
- For .docx: use mammoth.extractRawText

### generatePdf.js
```javascript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default async function generatePdf(elementId, fileName) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const A4_W_MM = 210, A4_H_MM = 297;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    width: 794,
    windowWidth: 794,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgW = A4_W_MM;
  const imgH = (canvas.height * A4_W_MM) / canvas.width;
  
  let heightLeft = imgH;
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
  heightLeft -= A4_H_MM;
  
  while (heightLeft > 0) {
    position -= A4_H_MM;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= A4_H_MM;
  }
  
  pdf.save(fileName || 'Resume.pdf');
}
```

### PhotoWidget.jsx features
- Accepts: photo (dataURL), onPhoto (file handler), ps (zoom/posX/posY), onPs (update handler), height, shape, borderColor
- Photo shapes via CSS clip-path:
  - square: none
  - circle: circle(50%)
  - rounded: inset(0 round 16px)
  - hexagon: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
  - diamond: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)
  - shield: polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)
- Mouse drag on photo: tracks mousemove to update posX/posY (multiply delta by 0.3 for smooth movement)
- Mouse wheel on photo: adjusts zoom (100-300)
- Hover overlay: shows "Change" and "Remove" buttons + zoom slider
- Click empty photo: opens file picker

### A4Wrapper.jsx features
- Ref to measure container width
- Scale = Math.min(1, containerWidth / 794)
- Apply CSS transform: scale(scaleValue) with transformOrigin: "top left"
- Measure content height with ref
- Calculate pages = Math.ceil(contentHeight / 1123)
- Show page break dividers at each 1123px boundary
- Show "Add New Page" button at bottom
- Page count label: "X pages · A4"

### EditableText.jsx
- contentEditable span/p/h1/h2 element
- onBlur: sends new text to onChange callback
- Hover: shows subtle dashed underline
- Focus: shows green dashed underline
- Props: value, onChange, tag (span/p/h1/h2), style, multiline, fontSize override

---

## AI GENERATION (in UploadPage or App.jsx)

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Expert resume writer. Extract ALL info. Return ONLY JSON, no backticks.
{"name":"","title":"","email":"","phone":"","location":"","summary":"","experience":[{"role":"","company":"","period":"","bullets":[""]}],"skills":[""],"education":[{"degree":"","school":"","year":""}],"certifications":[""]}
Use only real info from document. Empty string for missing.
Document:
${extractedText}`
    }]
  })
});
```

---

## STATE MANAGEMENT (in App.jsx)

```javascript
const [step, setStep] = useState("landing"); // landing | upload | generating | preview
const [resumeData, setResumeData] = useState(null);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [photoUrl, setPhotoUrl] = useState(null);
const [photoSettings, setPhotoSettings] = useState({ zoom: 100, posX: 50, posY: 50 });
const [photoShape, setPhotoShape] = useState("square");
const [colors, setColors] = useState({ accent, accent2, sidebar, heading, text, background });
const [globalFont, setGlobalFont] = useState({ size: null, family: null });
const [extractedText, setExtractedText] = useState("");
```

---

## COLOR PANEL CHANNELS (5 channels)
1. Accent - template accent color
2. Sidebar - sidebar/header background
3. Heading - heading text color
4. Body Text - paragraph text color  
5. Background - resume body background color (NEW - defaults to #fff for light templates, #0f172a for tech)

Preset swatches (16 colors):
#00E5A0, #3B82F6, #F43F5E, #F59E0B, #A78BFA, #38BDF8, #EC4899, #10B981, #C9A84C, #64748B, #1B2A4A, #0f172a, #1a1a2e, #333, #ffffff, #f8f6f0

---

## FONT PANEL
Global font size options: 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24
Font families: Outfit, Newsreader, JetBrains Mono, Georgia, Playfair Display, Lora, Merriweather, Raleway
- Selected = green background button
- Reset = red tinted button

---

## PHOTO SHAPES
6 options: square, circle, rounded, hexagon, diamond, shield
- Selected = green background
- Each uses CSS clip-path (see PhotoWidget above)

---

## CUSTOM SECTIONS
Available to add: Languages🌐, Projects🚀, Awards🏆, Hobbies🎯, Courses📚, Volunteering🤝
- For sidebar templates: show "Side" button (purple) + "Main" button (green)
- For non-sidebar templates: show only "Main" button
- Each section has editable items with add/delete
- Shows ✓ in green if already added

---

## ONedit HANDLER (switch/case pattern)
Fields: name, title, email, phone, location, summary
Skills: skill (edit), skill_del, skill_add
Education: edu_degree, edu_school, edu_year, edu_add
Experience: exp_role, exp_company, exp_period, exp_bullet, exp_bullet_del, exp_bullet_add, exp_del, exp_add
Custom: custom_item, custom_item_del, custom_item_add, custom_section_del, custom_section_add
Page: add_page_content (adds new experience block)

---

## PACKAGES TO INSTALL
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1"
  }
}
```

Note: PDF.js and Mammoth loaded from CDN (not npm) to avoid bundle issues.

---

## COMMAND FOR CLAUDE CODE

Read this entire blueprint file and build the complete project following every design spec exactly. Create all files in the folder structure shown above. Make sure:
1. Each template looks VISUALLY UNIQUE (the 3 sidebar-less templates must have completely different layouts)
2. All data passes through safe() before rendering
3. The dev server runs with npm run dev
4. PDF download works using html2canvas + jspdf
5. Photo drag/zoom/shapes all work
6. Every text on the resume is inline editable
7. The dark theme matches #08080e background with green #00E5A0 accents exactly
