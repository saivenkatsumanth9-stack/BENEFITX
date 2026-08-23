# Benefit Navigator

Build a complete, production-quality frontend web application called:

BENEFITX

Tagline:

“Discover. Understand. Prepare. Apply.”

PROJECT TYPE:

AI-powered Government Scheme Discovery & Application Readiness Platform

PRIMARY GOAL:

Build a highly polished, responsive, modern frontend that allows citizens to:

1. Create a personal profile

2. Discover government schemes relevant to them

3. See AI-based recommendation scores

4. Understand why a scheme is recommended

5. Check eligibility

6. Discover potentially missed schemes

7. View required documents

8. Track available/missing documents

9. Calculate and display an Application Readiness Score

10. View scheme details

11. Navigate to official application sources

12. Track saved schemes and application progress

IMPORTANT:

This is a frontend-first implementation.

Build the entire frontend with realistic working interactions and mock data/service layers.

DO NOT hardcode the UI in a way that makes future backend integration difficult.

Create clean API/service abstraction layers so I can later connect:

- Python/FastAPI backend

- ML recommendation model

- Government scheme database

- Authentication

- Document/OCR services

- Real-time scheme updates

The application must work completely with mock/local data initially.

==================================================

1. TECHNOLOGY

==================================================

Use:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui or equivalent accessible component system

- React Router

- TanStack Query where useful

- Recharts for charts

- Lucide React icons

- Form validation using Zod + React Hook Form

Use a clean component-based architecture.

Do not create one huge component.

Use reusable components and proper folder organization.

==================================================

2. DESIGN SYSTEM

==================================================

Create a premium government-tech / AI SaaS visual identity.

DESIGN DIRECTION:

Modern + trustworthy + intelligent + accessible.

Primary visual style:

- Clean white/light backgrounds

- Deep navy/blue typography

- Blue/teal technology accents

- Subtle saffron/orange highlights inspired by India

- Soft gradients

- Rounded cards

- Subtle shadows

- Thin borders

- Professional data visualization

- Clean spacing

- Minimal glassmorphism only where appropriate

Do NOT make it:

- Cartoonish

- Overly colorful

- Generic admin dashboard

- Visually cluttered

- Excessively futuristic

Use:

- Inter / Manrope / Poppins

- Strong visual hierarchy

- Large readable headings

- Consistent card styles

- Consistent button styles

- Professional icons

The application should feel like a serious citizen-service product that could be shown to government/industry judges.

==================================================

3. RESPONSIVE DESIGN

==================================================

The application must be fully responsive.

Support:

- Desktop

- Laptop

- Tablet

- Mobile

Desktop:

Sidebar + main content.

Mobile:

Bottom navigation or collapsible navigation.

Ensure:

- No horizontal scrolling

- Tables become responsive cards

- Charts resize correctly

- Forms work on mobile

- Buttons remain accessible

- Touch targets are sufficiently large

==================================================

4. APPLICATION STRUCTURE

==================================================

Create these main routes:

/

 /onboarding

 /dashboard

 /profile

 /recommendations

 /schemes

 /schemes/:id

 /eligibility/:id

 /documents

 /readiness

 /saved

 /applications

 /notifications

 /settings

 /help

==================================================

5. LANDING PAGE

==================================================

Create a premium landing page.

Hero section:

BENEFITX

“Discover the government benefits that may be relevant to you.”

Subheading:

“Get personalized scheme recommendations, understand your eligibility, identify missing documents, and know how ready you are to apply.”

Primary CTA:

“Check My Benefits”

Secondary CTA:

“Explore Schemes”

Hero visual:

Show a stylized dashboard preview with:

- AI recommendation card

- Match score

- Eligibility indicators

- Document readiness

- Application readiness score

Add feature section:

1. Personalized Recommendations

2. Explainable Eligibility

3. Missed Opportunity Detection

4. Smart Document Checklist

5. Application Readiness

6. Official Application Guidance

Add a simple “How it works” section:

Profile → Discover → Verify → Prepare → Apply

Add trust section:

“Designed as a decision-support layer using structured government scheme information.”

Do not make unsupported claims.

==================================================

6. ONBOARDING

==================================================

Create a multi-step profile onboarding flow.

Step 1:

Basic Information

Fields:

- Age

- Gender where relevant

- State

- District

- Rural/Urban

- Occupation

Step 2:

Education

- Education level

- Course/qualification

- Student status

Step 3:

Economic Profile

- Annual income range

- Employment status

- Farmer status where applicable

Step 4:

Additional Information

Only ask relevant fields.

IMPORTANT:

Do not ask unnecessary sensitive information.

Use progressive disclosure.

Show progress:

Step 2 of 4

At the end:

“Your Benefit Profile is Ready”

CTA:

“Find My Opportunities”

Save profile locally for demo purposes.

Create a ProfileContext or state-management layer that can later be connected to backend APIs.

==================================================

7. DASHBOARD

==================================================

Create a highly polished personalized dashboard.

Header:

“Good morning, [User Name]”

Subtitle:

“Here’s what we found for your profile.”

Top metrics:

- Relevant Opportunities

- Highly Matched Schemes

- Documents Ready

- Application Readiness

Example:

12

Relevant Opportunities

5

High Match

8/10

Documents Ready

80%

Application Ready

MAIN SECTION:

“Recommended for You”

Show 3–5 scheme cards.

Each card must contain:

- Scheme name

- Category

- Government level

- Short description

- Match score

- Eligibility status

- Benefit summary

- Required documents count

- “View Details”

- “Check Eligibility”

- Save button

Example:

Scholarship Scheme

94% Match

✓ Age matched

✓ Income matched

✓ Education matched

[View Details]

SECOND SECTION:

“You May Be Missing”

Show potentially relevant schemes.

Example:

“3 opportunities may be relevant to your profile”

Cards should explain:

“Why you may qualify”

THIRD SECTION:

“Application Readiness”

Display a large circular progress chart.

Example:

80%

Application Ready

Show:

✓ Eligibility verified

✓ 4 documents available

⚠ 1 document missing

CTA:

“Complete My Checklist”

==================================================

8. SCHEME RECOMMENDATION PAGE

==================================================

Route:

/recommendations

Title:

“Recommended Opportunities”

Add filters:

- Category

- State

- Age group

- Income range

- Education

- Occupation

- Government level

Add sorting:

- Best Match

- Recently Updated

- Highest Benefit

- Deadline

- Category

Create scheme cards.

Each card should show:

Match Score:

94%

Confidence:

High

Eligibility:

Likely Eligible

Benefits:

₹X / Scholarship / Subsidy / Support

Documents:

5 required

Status:

2 missing

Buttons:

“View Details”

“Check Eligibility”

“Save”

==================================================

9. AI RECOMMENDATION EXPERIENCE

==================================================

Create an AI recommendation explanation panel.

Title:

“Why BENEFITX Recommended This”

Show factor cards:

✓ Income matches requirement

✓ Age matches requirement

✓ Education matches requirement

✓ State requirement matches

Potential mismatch:

⚠ Income certificate needs verification

Add:

“Recommendation Score”

94%

Breakdown:

Profile Match

90%

Eligibility Match

100%

Document Readiness

75%

IMPORTANT:

Clearly label these as recommendation/readiness signals.

Do not claim that the ML model makes the official eligibility decision.

==================================================

10. MISSED OPPORTUNITIES

==================================================

Create a dedicated page:

/recommendations or /missed-opportunities

Title:

“Opportunities You May Have Missed”

Explain:

“Based on your profile, these schemes may be worth checking.”

Each card:

Scheme name

Why it may be relevant

Potential benefit

Eligibility factors

Documents required

Match score

Example:

“High relevance”

“Your profile matches 4 of 5 key criteria.”

CTA:

“Check Eligibility”

This is one of the key differentiating features of BENEFITX.

==================================================

11. SCHEME DETAILS PAGE

==================================================

Route:

/schemes/:id

Create a professional scheme detail page.

Header:

Scheme Name

Tags:

Education

Central Government

Sections:

1. Overview

2. Benefits

3. Eligibility

4. Required Documents

5. Application Process

6. Important Dates

7. Official Source

8. Your Match

Show:

YOUR MATCH

94%

Then:

Eligibility Summary

✓ Age

✓ Income

✓ State

✓ Education

⚠ Document verification required

Required Documents:

✓ Aadhaar

✓ Education Certificate

✕ Income Certificate

✓ Photograph

Application steps:

1. Prepare documents

2. Verify eligibility

3. Open official portal

4. Complete application

5. Submit

Primary CTA:

“Go to Official Application”

Secondary:

“Save Scheme”

Include source attribution area.

==================================================

12. ELIGIBILITY PAGE

==================================================

Route:

/eligibility/:id

Create an eligibility assessment UI.

Show:

“Eligibility Assessment”

Status:

“Likely Eligible”

Break requirements into cards.

For every criterion:

Criterion

Required

Your Value

Result

Example:

Age

18–30

21

✓ Match

Income

Below ₹3L

₹2.5L

✓ Match

State

Telangana

Telangana

✓ Match

Education

Graduate

Undergraduate

⚠ Verify

At the bottom:

“Eligibility Summary”

4 criteria matched

1 requires verification

Important:

Include a visible note:

“Eligibility information is based on the configured scheme rules. Always verify the latest official notification before applying.”

==================================================

13. DOCUMENT CENTER

==================================================

Route:

/documents

Create a document management interface.

Title:

“My Documents”

Show:

Available Documents

Missing Documents

Needs Verification

Document cards:

Aadhaar

Status: Available

Education Certificate

Status: Available

Income Certificate

Status: Missing

Photograph

Status: Available

Each document should have:

- Document name

- Status

- Required schemes count

- Upload button

- View button

- Verification badge

- Expiry indicator where applicable

Add upload modal.

For demo:

Use local file selection.

Do not actually send documents to a server.

Create a service abstraction:

documentService.upload()

so I can connect OCR/backend later.

==================================================

14. DOCUMENT CHECKLIST FOR EACH SCHEME

==================================================

Create a checklist component.

Example:

APPLICATION DOCUMENT CHECKLIST

✓ Aadhaar

✓ Education Certificate

✓ Photograph

✕ Income Certificate

⚠ Caste Certificate if applicable

Show:

4/6 ready

Progress bar.

Button:

“Complete Checklist”

==================================================

15. APPLICATION READINESS

==================================================

Route:

/readiness

Create a premium readiness dashboard.

Main score:

82%

APPLICATION READINESS

Breakdown:

Eligibility

100%

Documents

75%

Verification

80%

Show:

READY:

✓ Profile completed

✓ Eligibility checked

✓ 4 required documents available

ACTION NEEDED:

⚠ Income Certificate

⚠ Verify Education Certificate

Create a clear action list.

CTA:

“Complete Remaining Steps”

==================================================

16. APPLICATION TRACKER

==================================================

Route:

/applications

Allow users to track saved/application states.

Statuses:

Saved

Preparing

Ready to Apply

Applied

Under Review

Completed

Create timeline UI.

Example:

Scholarship A

✓ Saved

✓ Eligibility checked

✓ Documents prepared

→ Ready to Apply

○ Application pending

This can initially use mock state.

==================================================

17. SAVED SCHEMES

==================================================

Route:

/saved

Allow users to save schemes.

Features:

- Search

- Filter

- Remove saved scheme

- View details

- Check eligibility

- Track readiness

==================================================

18. NOTIFICATIONS

==================================================

Route:

/notifications

Create notification center.

Examples:

“New relevant scheme detected”

“Your application readiness increased to 90%”

“Income Certificate is still missing”

“Scheme information was updated”

Use mock notifications initially.

Later connect to backend notification service.

==================================================

19. PROFILE

==================================================

Route:

/profile

Allow users to edit:

- Age

- State

- District

- Education

- Occupation

- Income range

- Other relevant attributes

Show:

Profile completeness:

85%

Button:

“Update Recommendations”

When profile changes, simulate recommendation refresh.

==================================================

20. SETTINGS

==================================================

Include:

- Language

- Notification preferences

- Privacy

- Data preferences

- Accessibility

- Theme

- Logout

Do not implement unnecessary authentication complexity.

==================================================

21. SEARCH

==================================================

Global search.

Search:

- Scheme names

- Categories

- Benefits

- Keywords

Show instant results.

Filters:

Category

State

Government level

Eligibility type

==================================================

22. EMPTY STATES

==================================================

Every page must have professional empty states.

Examples:

No recommendations:

“Complete your profile to discover relevant opportunities.”

No documents:

“You haven't added any documents yet.”

No saved schemes:

“Save schemes to access them quickly later.”

No applications:

“You haven't started an application yet.”

==================================================

23. LOADING STATES

==================================================

Create skeleton loaders.

When recommendation loading:

“Analyzing your profile…”

Animated progress steps:

Understanding profile

Matching schemes

Checking eligibility

Preparing recommendations

Do not fake actual ML results in text.

Clearly treat demo data as mock data.

==================================================

24. ERROR HANDLING

==================================================

Create proper UI states for:

- API failure

- Invalid form

- Missing profile fields

- File upload failure

- No recommendations

- Scheme unavailable

- Network failure

Use toast notifications.

Example:

“Unable to load recommendations. Please try again.”

==================================================

25. ACCESSIBILITY

==================================================

Follow accessibility best practices.

Include:

- Semantic HTML

- Keyboard navigation

- Visible focus states

- ARIA labels

- Sufficient contrast

- Accessible forms

- Screen-reader friendly labels

Do not depend only on color to communicate status.

Use:

✓

⚠

✕

along with colors.

==================================================

26. MOCK DATA ARCHITECTURE

==================================================

Create realistic mock data for at least:

20 government schemes.

Each scheme object should support fields such as:

id

name

shortDescription

category

governmentLevel

state

benefits

eligibility

requiredDocuments

applicationSteps

officialUrl

lastUpdated

deadline

tags

Example structure:

{

  id,

  name,

  category,

  governmentLevel,

  description,

  benefits,

  eligibility: {

    ageMin,

    ageMax,

    incomeMax,

    states,

    education,

    occupation

  },

  documents: [],

  applicationSteps: [],

  officialUrl,

  lastUpdated

}

Keep mock data isolated from UI components.

==================================================

27. SERVICE/API ABSTRACTION

==================================================

Create service files such as:

schemeService.ts

recommendationService.ts

eligibilityService.ts

documentService.ts

profileService.ts

applicationService.ts

Initially these services should return mock/local data.

Example conceptual API:

getSchemes()

getSchemeById(id)

getRecommendations(profile)

checkEligibility(profile, scheme)

getRequiredDocuments(schemeId)

getApplicationReadiness(profile, schemeId)

getSavedSchemes()

saveScheme(id)

IMPORTANT:

The UI must consume these service functions instead of directly accessing mock arrays.

This makes future backend integration easy.

==================================================

28. FUTURE BACKEND INTEGRATION

==================================================

Prepare the frontend so I can later replace mock services with:

Frontend

↓

REST API

↓

FastAPI / Node backend

↓

Database

↓

ML inference service

Do not couple frontend components directly to a specific database.

Do not put database credentials in frontend code.

Use environment variables for future API URLs.

Example:

VITE_API_BASE_URL

==================================================

29. ML INTEGRATION PLACEHOLDER

==================================================

Create a clean recommendation service interface.

Input:

UserProfile

Output:

Recommendation[]

Each recommendation should contain:

schemeId

matchScore

confidence

matchedFactors

unmatchedFactors

ranking

Example:

{

  schemeId: "scheme-001",

  matchScore: 94,

  confidence: "high",

  matchedFactors: [

    "Age",

    "Income",

    "State"

  ],

  unmatchedFactors: [],

  ranking: 1

}

For now, use mock inference.

Later I will connect the real ML API.

==================================================

30. DOCUMENT/OCR INTEGRATION PLACEHOLDER

==================================================

Create an abstraction for future OCR:

extractDocumentData(file)

Return:

documentType

extractedFields

confidence

verificationStatus

For the MVP frontend:

simulate this with mock responses.

Do not build fake claims that OCR is actually verifying document authenticity.

==================================================

31. APPLICATION READINESS CALCULATION

==================================================

Create a reusable readiness calculation function.

Inputs:

eligibilityStatus

requiredDocuments

availableDocuments

verificationStatus

Output:

readinessScore

missingDocuments

completedRequirements

nextActions

Example:

{

  readinessScore: 80,

  completedRequirements: 4,

  totalRequirements: 5,

  missingDocuments: ["Income Certificate"],

  nextActions: ["Upload Income Certificate"]

}

Keep this calculation independent from the UI so I can replace it with backend logic later.

==================================================

32. SECURITY & PRIVACY

==================================================

Do not store sensitive personal information unnecessarily.

Do not expose:

- API keys

- Database credentials

- Authentication secrets

Use mock/local data for demo.

Show a simple privacy notice:

“Only information required for personalization should be provided.”

==================================================

33. PERFORMANCE

==================================================

Optimize for:

- Fast initial loading

- Lazy-loaded routes where useful

- Efficient rendering

- Reusable components

- Avoid unnecessary API calls

- Responsive charts

- Optimized assets

==================================================

34. COMPONENT ARCHITECTURE

==================================================

Create reusable components such as:

AppSidebar

MobileNavigation

TopBar

SchemeCard

RecommendationCard

EligibilityCard

DocumentCard

ReadinessScore

ProgressRing

MatchScore

RequirementRow

DocumentChecklist

FilterBar

SearchBar

StatusBadge

EmptyState

LoadingSkeleton

NotificationCard

ApplicationTimeline

ProfileProgress

MetricCard

OfficialSourceCard

Do not duplicate UI code.

==================================================

35. DASHBOARD VISUAL PRIORITY

==================================================

The most important visual elements should be:

1. Recommended schemes

2. Missed opportunities

3. Eligibility status

4. Application readiness

5. Missing documents

These should be immediately visible.

==================================================

36. DEMO MODE

==================================================

Create a Demo Mode for the hackathon.

Provide a button:

“Try Demo Profile”

Clicking it loads a realistic example citizen profile.

Example:

Age: 21

State: Telangana

Education: Undergraduate

Occupation: Student

Income: ₹2.5 lakh

Then populate:

Recommended schemes

Eligibility results

Missing documents

Readiness score

This allows judges to experience the entire product quickly.

==================================================

37. DEMO STORY

==================================================

The demo should follow this exact flow:

Landing Page

↓

Try Demo

↓

Profile Loaded

↓

Dashboard

↓

Recommended Schemes

↓

Missed Opportunities

↓

Open Scheme

↓

Eligibility Explanation

↓

Document Checklist

↓

Application Readiness

↓

Official Application

Make this flow extremely smooth.

==================================================

38. FINAL QUALITY REQUIREMENTS

==================================================

Before completing the application:

- Check every route.

- Check every button.

- Check every form.

- Check mobile responsiveness.

- Check empty states.

- Check loading states.

- Check error states.

- Check navigation.

- Check browser console for errors.

- Remove placeholder text.

- Remove broken links.

- Ensure no dead buttons.

- Ensure no fake backend claims.

- Ensure all mock data is clearly structured.

- Ensure the application can run without backend services.

The final result should look like a real product prototype ready for a national-level hackathon demonstration.

The product should communicate:

“BENEFITX doesn't just help citizens search for government schemes.

It helps them discover what may be relevant to them, understand why they match, identify what they are missing, and become ready to apply.”

FINAL TAGLINE:

DISCOVER.

UNDERSTAND.

PREPARE.

APPLY.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/39f0fec3-e133-4792-987b-74beddd2d5e0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
