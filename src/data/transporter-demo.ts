export type DemoTruck = {
  id: string;
  registration: string;
  type: string;
  capacity: number;
  reefer: boolean;
  driver: string;
};

export const demoFleet: DemoTruck[] = [
  { id: "truck-1", registration: "PB 10 AB 4821", type: "Multi-axle", capacity: 14, reefer: false, driver: "Manpreet Singh" },
  { id: "truck-2", registration: "PB 10 CD 7134", type: "Refrigerated", capacity: 12, reefer: true, driver: "Gurpreet Kaur" },
  { id: "truck-3", registration: "HR 55 EF 2608", type: "Container", capacity: 18, reefer: false, driver: "Sukhdev Kumar" },
  { id: "truck-4", registration: "PB 10 GH 9916", type: "Open body", capacity: 9, reefer: false, driver: "Jasmeet Gill" },
  { id: "truck-5", registration: "DL 01 JK 3502", type: "Refrigerated", capacity: 16, reefer: true, driver: "Amandeep Gill" },
];

export const suggestedDestinations = ["Delhi", "Ludhiana", "Jaipur", "Chandigarh", "Amritsar", "Lucknow", "Jalandhar", "Agra"];

export const transporterCopy = {
  en: {
    heading: "How do you run your trucks?", role: "Transporter", chooseSetup: "Choose the setup that matches your operation.", single: "Single Truck Owner", singleDescription: "Set availability for one truck.", fleet: "Fleet Owner", fleetDescription: "Manage availability across multiple trucks.", back: "Back", continue: "Continue", findLoads: "Find loads", stepOf: "of", steps: ["Dates", "Area", "Capacity", "Reefer", "Truck details", "Review"],
    dates: "When are you available?", from: "Available from", to: "Available until", applyDates: "Apply dates to all selected trucks", range: "Where do you want to work?", currentCity: "Current city", radius: "Maximum radius", preferred: "Preferred destinations", avoid: "Destinations to avoid", space: "How much room is available?", tons: "Available tonnes", percent: "Truck space available", reefer: "Refrigerated storage", yes: "Yes", no: "No", extra: "Trip preferences", headingTo: "Heading to", returningFrom: "Returning from", vehicle: "Vehicle type", capacity: "Truck capacity (tonnes)", minimumRate: "Minimum acceptable price / km", shared: "Accept shared / part loads", pickupWindow: "Preferred pickup time", morning: "Morning", afternoon: "Afternoon", evening: "Evening", selectTrucks: "Select your available trucks", addTruck: "Add truck", registration: "Registration number", driver: "Driver name", saveTruck: "Add to fleet", cancel: "Cancel", review: "Availability summary", fleet: "Fleet", match: "Matched load offers", fee: "Platform fee", net: "Estimated net earning", returnFill: "Fills your return trip", emptyKm: "empty km avoided", accept: "Accept load", decline: "Decline", accepted: "Load accepted", declined: "Declined", noMatch: "No match yet", reeferYes: "Reefer", reeferNo: "Dry truck", loadRoute: "Route", cargoType: "Cargo", weight: "Weight", pickupWindowLabel: "Pickup window", price: "Load price", netAfterFee: "Net after fee", partLoads: "Part loads welcome", offerTitle: "Loads that fit your journey", offerSubtitle: "These loads match your dates, route and free capacity.", yourTrucks: "Your trucks", otherDestinations: "Enter a destination", cityRequired: "Choose a current city.", dateRequired: "Choose a valid availability date range.", trucksRequired: "Select at least one available truck.",
    overrideRange: "Override range per truck", vehicleOptions: ["Mini truck", "LCV", "Container", "Open body", "Multi-axle", "Refrigerated"], pickupWindows: ["Morning", "Afternoon", "Evening"],
  },
  hi: {
    heading: "आपके ट्रक कैसे चलते हैं?", role: "ट्रांसपोर्टर", chooseSetup: "अपने काम के अनुसार विकल्प चुनें।", single: "एक ट्रक मालिक", singleDescription: "एक ट्रक की उपलब्धता बताएँ।", fleet: "फ्लीट मालिक", fleetDescription: "कई ट्रकों की उपलब्धता संभालें।", back: "वापस", continue: "आगे बढ़ें", findLoads: "लोड खोजें", stepOf: "में से", steps: ["तारीख", "क्षेत्र", "जगह", "रेफर", "ट्रक जानकारी", "जाँच"],
    dates: "आप कब उपलब्ध हैं?", from: "कब से उपलब्ध", to: "कब तक उपलब्ध", applyDates: "तारीखें सभी चुने ट्रकों पर लागू करें", range: "किस क्षेत्र में काम करेंगे?", currentCity: "मौजूदा शहर", radius: "अधिकतम दूरी", preferred: "पसंदीदा मंज़िलें", avoid: "जिन शहरों से बचें", space: "कितनी जगह उपलब्ध है?", tons: "उपलब्ध टन", percent: "ट्रक की उपलब्ध जगह", reefer: "रेफ्रिजरेटेड स्टोरेज", yes: "हाँ", no: "नहीं", extra: "यात्रा की पसंद", headingTo: "जा रहे हैं", returningFrom: "वापस आ रहे हैं", vehicle: "ट्रक का प्रकार", capacity: "ट्रक क्षमता (टन)", minimumRate: "न्यूनतम कीमत / किमी", shared: "साझा / आंशिक लोड स्वीकारें", pickupWindow: "पिकअप का पसंदीदा समय", morning: "सुबह", afternoon: "दोपहर", evening: "शाम", selectTrucks: "उपलब्ध ट्रक चुनें", addTruck: "ट्रक जोड़ें", registration: "रजिस्ट्रेशन नंबर", driver: "ड्राइवर का नाम", saveTruck: "फ्लीट में जोड़ें", cancel: "रद्द करें", review: "उपलब्धता सारांश", fleet: "फ्लीट", match: "मिले हुए लोड", fee: "प्लेटफ़ॉर्म शुल्क", net: "अनुमानित शुद्ध कमाई", returnFill: "वापसी का ट्रिप भरेगा", emptyKm: "खाली किमी बचेंगे", accept: "लोड स्वीकारें", decline: "मना करें", accepted: "लोड स्वीकार किया", declined: "मना किया", noMatch: "अभी कोई मिलान नहीं", reeferYes: "रेफर", reeferNo: "सामान्य ट्रक", loadRoute: "रूट", cargoType: "माल", weight: "वज़न", pickupWindowLabel: "पिकअप समय", price: "लोड की कीमत", netAfterFee: "शुल्क के बाद", partLoads: "आंशिक लोड स्वीकारें", offerTitle: "आपकी यात्रा के अनुसार लोड", offerSubtitle: "ये लोड आपकी तारीख, रूट और खाली जगह से मेल खाते हैं।", yourTrucks: "आपके ट्रक", otherDestinations: "मंज़िल चुनें", cityRequired: "मौजूदा शहर चुनें।", dateRequired: "सही उपलब्धता तारीखें चुनें।", trucksRequired: "कम से कम एक ट्रक चुनें।",
    overrideRange: "हर ट्रक का क्षेत्र अलग चुनें", vehicleOptions: ["मिनी ट्रक", "एलसीवी", "कंटेनर", "ओपन बॉडी", "मल्टी-एक्सल", "रेफ्रिजरेटेड"], pickupWindows: ["सुबह", "दोपहर", "शाम"],
  },
} as const;