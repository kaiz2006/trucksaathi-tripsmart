export const appCopy = {
  en: {
    language: "Language",
    tagline: "Every kilometre earns.",
    homeTitle: "How are you using TruckSaathi today?",
    homeIntro: "Plan a full journey, not just the next load.",
    impactTitle: "TruckSaathi impact",
    moneySaved: "Money saved so far",
    carbonReduced: "Carbon reduced",
    emptyKmAvoided: "Empty km avoided",
    shipperRole: "Shipper / Business Owner",
    shipperDescription: "Move your goods with a truck that fits the route.",
    transporterRole: "Transporter / Truck Operator",
    transporterDescription: "Find loads for the whole journey, including the return.",
    loginTitle: "Let’s get you on the road",
    loginIntro: "Enter your mobile number to continue.",
    phoneLabel: "Mobile number",
    phonePlaceholder: "10-digit mobile number",
    sendCode: "Continue",
    otpTitle: "Enter your verification code",
    otpIntro: "A demo code is shown below. Any four digits will work.",
    otpLabel: "4-digit code",
    otpHint: "Demo hint: 1234",
    verify: "Verify and continue",
    phoneError: "Enter a valid 10-digit Indian mobile number.",
    otpError: "Enter any four digits to continue.",
    roleShipper: "Shipper",
    roleTransporter: "Transporter",
    welcome: "Welcome to TruckSaathi",
    startTitleShipper: "Your next shipment starts here.",
    startTitleTransporter: "Let’s put your truck to work.",
    startDescription: "Your account is ready. Your workspace will grow as you set up your first journey.",
    primaryShipper: "Plan a shipment",
    primaryTransporter: "Find loads",
    homeTab: "Home",
    activityTab: "Activity",
    notificationsTab: "Notifications",
    profileTab: "Profile",
    signedInAs: "Signed in as",
    phoneSuffix: "Change role",
  },
  hi: {
    language: "भाषा",
    tagline: "हर किलोमीटर कमाई करे।",
    homeTitle: "आज TruckSaathi का उपयोग कैसे करेंगे?",
    homeIntro: "सिर्फ अगले लोड की नहीं, पूरी यात्रा की योजना बनाएँ।",
    impactTitle: "TruckSaathi का असर",
    moneySaved: "अब तक की बचत",
    carbonReduced: "कार्बन में कमी",
    emptyKmAvoided: "बचे खाली किमी",
    shipperRole: "शिपर / व्यवसाय मालिक",
    shipperDescription: "अपने रूट के लिए सही ट्रक से सामान भेजें।",
    transporterRole: "ट्रांसपोर्टर / ट्रक ऑपरेटर",
    transporterDescription: "वापसी समेत पूरी यात्रा के लिए लोड पाएँ।",
    loginTitle: "सफ़र शुरू करें",
    loginIntro: "जारी रखने के लिए अपना मोबाइल नंबर डालें।",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "10 अंकों का मोबाइल नंबर",
    sendCode: "जारी रखें",
    otpTitle: "वेरिफिकेशन कोड डालें",
    otpIntro: "यह डेमो कोड है। कोई भी चार अंक काम करेंगे।",
    otpLabel: "4 अंकों का कोड",
    otpHint: "डेमो कोड: 1234",
    verify: "वेरिफाई करके जारी रखें",
    phoneError: "सही 10 अंकों का भारतीय मोबाइल नंबर डालें।",
    otpError: "जारी रखने के लिए कोई भी चार अंक डालें।",
    roleShipper: "शिपर",
    roleTransporter: "ट्रांसपोर्टर",
    welcome: "TruckSaathi में आपका स्वागत है",
    startTitleShipper: "आपकी अगली शिपमेंट यहाँ से शुरू होती है।",
    startTitleTransporter: "आपके ट्रक को काम पर लगाएँ।",
    startDescription: "आपका अकाउंट तैयार है। पहली यात्रा बनाते ही आपका वर्कस्पेस तैयार होगा।",
    primaryShipper: "शिपमेंट की योजना बनाएँ",
    primaryTransporter: "लोड खोजें",
    homeTab: "होम",
    activityTab: "गतिविधि",
    notificationsTab: "सूचनाएँ",
    profileTab: "प्रोफ़ाइल",
    signedInAs: "लॉगिन किया है",
    phoneSuffix: "भूमिका बदलें",
  },
} as const;

export type AppLanguage = keyof typeof appCopy;
export type AppCopy = (typeof appCopy)[AppLanguage];
export type AppRole = "shipper" | "transporter";

export function getAppRole(search: Record<string, unknown>): AppRole {
  return search.role === "transporter" ? "transporter" : "shipper";
}

export const workflowCopy = {
  en: {
    loading: "Loading shipment draft", destination: "On the way to Delhi", trackingBack: "Back to activity", speedUp: "Speed up demo", arrival: "Estimated arrival", delivered: "Delivered", arrived: "Your shipment has arrived", remaining: "min remaining", pickupOtp: "Pickup OTP", deliveryOtp: "Delivery OTP", verify: "Verify", verified: "Verified", journeyImpact: "Journey impact", journeyTime: "Estimated journey", moneySaved: "Money saved", carbonReduced: "Carbon reduced", temperature: "Live cargo temperature", target: "Target", inRange: "In range", driver: "Manpreet Singh", vehicle: "14T Multi-axle · PB 10 AB 4821", callDriver: "Call driver", chatDriver: "Chat with driver", shareTracking: "Share tracking link", trackingCopied: "Tracking link copied", demoChat: "Demo chat is ready", receipt: "Delivered successfully", experience: "How was your experience?", comment: "Add a comment (optional)", submitRating: "Submit rating", thanksRating: "Thanks for rating your trip", viewActivity: "View activity", estimatedJourneyValue: "5h 20m", receiptRoute: "Ludhiana → Delhi · ₹24,000", activityTitleShipper: "Your shipments", activityTitleTransporter: "Your trips", activityIntro: "Upcoming and completed journeys, all in one place.", upcomingCompleted: "Upcoming and completed", inbox: "Inbox", inboxTitle: "Updates for your journey", inboxIntro: "Mock WhatsApp and SMS updates for this demo.", whatsappDemo: "WhatsApp · Demo", profileTitle: "Business profile", driverTitle: "Driver profile", verifiedProfile: "Verified", languageEnglish: "English", languageHindi: "हिन्दी", fleetLabel: "My fleet", switchRole: "Switch role", currentLeg: "Current leg: Delhi → Ludhiana", activeTrip: "Active trip", nextLeg: "Next leg", nextRoute: "Ludhiana → Delhi", nextDetails: "8 t · General cargo · Pickup tomorrow, 8:00 AM", earningsImpact: "Earnings and impact", earningsSoFar: "Earnings so far", extraEmpty: "Extra vs returning empty", emptyKm: "Empty kilometres avoided", openTracking: "Open live tracking", available: "Available", currentStatus: ["Confirmed", "Truck heading to pickup", "Loaded", "In transit", "Delivered"],
  },
  hi: {
    loading: "शिपमेंट ड्राफ़्ट खुल रहा है", destination: "दिल्ली की ओर", trackingBack: "गतिविधि पर वापस जाएँ", speedUp: "डेमो तेज़ करें", arrival: "अनुमानित आगमन", delivered: "डिलीवर हुआ", arrived: "आपका सामान पहुँच गया है", remaining: "मिनट बाकी", pickupOtp: "पिकअप OTP", deliveryOtp: "डिलीवरी OTP", verify: "वेरिफाई करें", verified: "वेरिफाई हुआ", journeyImpact: "यात्रा का असर", journeyTime: "अनुमानित यात्रा", moneySaved: "बचत", carbonReduced: "कार्बन में कमी", temperature: "माल का लाइव तापमान", target: "लक्ष्य", inRange: "सीमा में", driver: "मनप्रीत सिंह", vehicle: "14 टन मल्टी-एक्सल · PB 10 AB 4821", callDriver: "ड्राइवर को कॉल करें", chatDriver: "ड्राइवर से चैट करें", shareTracking: "ट्रैकिंग लिंक साझा करें", trackingCopied: "ट्रैकिंग लिंक कॉपी हुआ", demoChat: "डेमो चैट तैयार है", receipt: "सफलतापूर्वक डिलीवर हुआ", experience: "आपका अनुभव कैसा था?", comment: "टिप्पणी जोड़ें (वैकल्पिक)", submitRating: "रेटिंग भेजें", thanksRating: "यात्रा की रेटिंग देने के लिए धन्यवाद", viewActivity: "गतिविधि देखें", estimatedJourneyValue: "5 घंटे 20 मिनट", receiptRoute: "लुधियाना → दिल्ली · ₹24,000", activityTitleShipper: "आपकी शिपमेंट", activityTitleTransporter: "आपकी यात्राएँ", activityIntro: "आने वाली और पूरी हुई यात्राएँ एक जगह।", upcomingCompleted: "आने वाली और पूरी हुई", inbox: "इनबॉक्स", inboxTitle: "आपकी यात्रा के अपडेट", inboxIntro: "इस डेमो के लिए WhatsApp और SMS अपडेट।", whatsappDemo: "WhatsApp · डेमो", profileTitle: "व्यवसाय प्रोफ़ाइल", driverTitle: "ड्राइवर प्रोफ़ाइल", verifiedProfile: "सत्यापित", languageEnglish: "अंग्रेज़ी", languageHindi: "हिन्दी", fleetLabel: "मेरी फ्लीट", switchRole: "भूमिका बदलें", currentLeg: "मौजूदा चरण: दिल्ली → लुधियाना", activeTrip: "चालू यात्रा", nextLeg: "अगला चरण", nextRoute: "लुधियाना → दिल्ली", nextDetails: "8 टन · सामान्य माल · कल सुबह 8 बजे पिकअप", earningsImpact: "कमाई और असर", earningsSoFar: "अब तक की कमाई", extraEmpty: "खाली वापसी की तुलना में अतिरिक्त", emptyKm: "बचे खाली किलोमीटर", openTracking: "लाइव ट्रैकिंग खोलें", available: "उपलब्ध", currentStatus: ["पुष्टि हुई", "ट्रक पिकअप के लिए आ रहा है", "लोड हो गया", "रास्ते में", "डिलीवर हुआ"],
  },
} as const;

export const offerCopy = {
  en: {
    match: "Matched load offers", title: "Loads that fit your journey", intro: "These loads match your dates, route and free capacity.", matches: "matches", match: "match", noMatch: "No match yet", weight: "Weight", cargo: "Cargo", pickup: "Pickup window", price: "Load price", fee: "Platform fee", net: "Net after fee", returnFill: "Fills your return trip", emptyKm: "empty km avoided", accept: "Accept load", decline: "Decline", accepted: "Load accepted", declined: "Declined", unmatchedOnly: "Show unmatched trucks only", allTrucks: "Show all trucks", unknownDriver: "Driver", reefer: "Reefer",
  },
  hi: {
    match: "मिले हुए लोड", title: "आपकी यात्रा के लिए लोड", intro: "ये लोड आपकी तारीख, रूट और खाली जगह से मेल खाते हैं।", matches: "मिलान", match: "मिलान", noMatch: "अभी कोई मिलान नहीं", weight: "वज़न", cargo: "माल", pickup: "पिकअप समय", price: "लोड की कीमत", fee: "प्लेटफ़ॉर्म शुल्क", net: "शुल्क के बाद", returnFill: "वापसी यात्रा भरेगा", emptyKm: "खाली किमी बचेंगे", accept: "लोड स्वीकारें", decline: "मना करें", accepted: "लोड स्वीकार किया", declined: "मना किया", unmatchedOnly: "बिना मिलान वाले ट्रक दिखाएँ", allTrucks: "सभी ट्रक दिखाएँ", unknownDriver: "ड्राइवर", reefer: "रेफर",
  },
} as const;