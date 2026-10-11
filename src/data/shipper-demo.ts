export const cargoTypes = [
  "General Cargo",
  "Temperature Sensitive Cargo",
  "Fragile & High-Value",
  "Heavy & Oversized",
  "Bulk Material",
  "Furniture & Household",
] as const;

export type CargoType = (typeof cargoTypes)[number];

export const northCities = [
  { name: "Ludhiana", lat: 30.9, lon: 75.8573 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Ambala", lat: 30.3782, lon: 76.7767 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Jalandhar", lat: 31.326, lon: 75.5762 },
  { name: "Amritsar", lat: 31.634, lon: 74.8723 },
  { name: "Patiala", lat: 30.3398, lon: 76.3869 },
  { name: "Karnal", lat: 29.6857, lon: 76.9905 },
  { name: "Panipat", lat: 29.3909, lon: 76.9635 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Haridwar", lat: 29.9457, lon: 78.1642 },
  { name: "Meerut", lat: 28.9845, lon: 77.7064 },
  { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  { name: "Noida", lat: 28.5355, lon: 77.391 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Jammu", lat: 32.7266, lon: 74.857 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Shimla", lat: 31.1048, lon: 77.1734 },
  { name: "Manali", lat: 32.2396, lon: 77.1887 },
  { name: "Hisar", lat: 29.1492, lon: 75.7217 },
  { name: "Rohtak", lat: 28.8955, lon: 76.6066 },
  { name: "Bathinda", lat: 30.211, lon: 74.9455 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Bareilly", lat: 28.367, lon: 79.4304 },
  { name: "Moradabad", lat: 28.8386, lon: 78.7733 },
  { name: "Rudrapur", lat: 28.9875, lon: 79.4141 },
  { name: "Bikaner", lat: 28.0229, lon: 73.3119 },
  { name: "Kota", lat: 25.2138, lon: 75.8648 },
] as const;

export function roadDistanceKm(fromName: string, toName: string): number {
  const from = northCities.find((city) => city.name === fromName);
  const to = northCities.find((city) => city.name === toName);
  if (!from || !to) return 0;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lon - from.lon);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25);
}

export const cargoTypeLabels = {
  en: cargoTypes,
  hi: ["सामान्य माल", "तापमान-संवेदनशील माल", "नाज़ुक और कीमती", "भारी और बड़ा सामान", "थोक सामग्री", "फर्नीचर और घरेलू सामान"],
} as const;

export const shipperCopy = {
  en: {
    heading: "What are you moving?", back: "Back", continue: "Continue", steps: ["Load", "Route", "Timing", "Review"],
    typeDescription: ["Boxes, pallets and packaged goods", "Cold-chain vehicles with temperature control", "Extra care and optional insurance", "Large items that may need permits", "Grain, sand, cement and loose goods", "Moving help available at pickup"],
    sizeTitle: "Tell us about the load", sizeIntro: "A quick estimate helps find the right truck.", weight: "Estimated weight", description: "What are you shipping?", descriptionPlaceholder: "Add a short cargo description", dimensions: "Optional dimensions (metres)", length: "Length", width: "Width", height: "Height", small: "Small", medium: "Medium", large: "Large", full: "Full truck", smallDetail: "Under 500 kg", mediumDetail: "500 kg–2 t", largeDetail: "2–8 t", fullDetail: "8 t+", temperature: "Ideal temperature range", frozen: "Frozen · −25 to −18°C", chilled: "Chilled · 2 to 8°C", cool: "Cool · 8 to 15°C", customTemp: "Custom range", cargoKind: "Cargo kind", cargoKinds: ["Dairy", "Pharma", "Produce", "Seafood", "Other"], insured: "Add transit insurance", permit: "Permit or escort notes", bulkMode: "Bulk packaging", bulkModes: ["Loose", "Bagged"], loadingHelp: "I need loading help at pickup",
    routeTitle: "Where is it going?", routeIntro: "Choose from North India cities or enter a nearby address.", pickup: "Pickup city or address", dropoff: "Drop-off city or address", addressPlaceholder: "Choose a city", routeLabel: "Estimated route", distance: "road km", mapPin: "Pin on map", scheduleTitle: "When should it arrive?", scheduleIntro: "Flexible dates can unlock a lower price.", pickupDate: "Pickup by", deliveryDate: "Deliver by", flexible: "Flexible", urgent: "Urgent", flexibleNote: "Flexible pickup gives us room to match a truck already on this route, often at a lower price.", urgentNote: "Prioritise the quickest available truck.", reviewTitle: "Review your shipment", cargo: "Cargo", route: "Route", deadline: "Delivery deadline", estimate: "Estimated price", priceNote: "Final quote depends on truck availability and exact loading details.", book: "Find my truck", matching: "Finding the best truck for you…", recommended: "Recommended for your route", reefer: "Refrigerated", etaPickup: "Pickup ETA", etaDelivery: "Delivery ETA", why: "Why this match?", save: "You save", dedicated: "vs a dedicated truck", alternative: "Other available trucks", cheaper: "Cheaper · slower", faster: "Faster · higher price", confirm: "Confirm booking", confirmed: "Booking confirmed", bookingId: "Booking ID", track: "Track this shipment", rupee: "₹", insurance: "Insurance requested", permitNote: "Permit / escort note", loose: "Loose bulk", bagged: "Bagged bulk", loading: "Loading help requested", flexibleShort: "Flexible", urgentShort: "Urgent", selected: "Selected", routeError: "Choose a pickup and drop-off city.", descriptionError: "Add a short description for the load.", dateError: "Choose a valid pickup and delivery date.", useBooking: "Draft stays on this device for this demo.",
  },
  hi: {
    heading: "क्या भेजना है?", back: "वापस", continue: "आगे बढ़ें", steps: ["लोड", "रूट", "समय", "जाँच"],
    typeDescription: ["डिब्बे, पैलेट और पैक किया सामान", "तापमान नियंत्रण वाले कोल्ड-चेन ट्रक", "अतिरिक्त सुरक्षा और बीमा विकल्प", "परमिट की ज़रूरत वाला बड़ा सामान", "अनाज, रेत, सीमेंट और खुला माल", "पिकअप पर सामान उठाने में मदद"],
    sizeTitle: "लोड के बारे में बताएँ", sizeIntro: "सही ट्रक ढूँढने के लिए अनुमान बताएँ।", weight: "अनुमानित वज़न", description: "क्या भेज रहे हैं?", descriptionPlaceholder: "माल के बारे में छोटा विवरण", dimensions: "वैकल्पिक माप (मीटर)", length: "लंबाई", width: "चौड़ाई", height: "ऊँचाई", small: "छोटा", medium: "मध्यम", large: "बड़ा", full: "पूरा ट्रक", smallDetail: "500 किग्रा से कम", mediumDetail: "500 किग्रा–2 टन", largeDetail: "2–8 टन", fullDetail: "8 टन से अधिक", temperature: "ज़रूरी तापमान सीमा", frozen: "जमा हुआ · −25 से −18°C", chilled: "ठंडा · 2 से 8°C", cool: "सामान्य ठंडा · 8 से 15°C", customTemp: "अपनी सीमा चुनें", cargoKind: "माल का प्रकार", cargoKinds: ["डेयरी", "दवा", "उपज", "समुद्री भोजन", "अन्य"], insured: "ट्रांज़िट बीमा जोड़ें", permit: "परमिट या एस्कॉर्ट की जानकारी", bulkMode: "थोक पैकिंग", bulkModes: ["खुला", "बोरी में"], loadingHelp: "पिकअप पर लोडिंग में मदद चाहिए",
    routeTitle: "माल कहाँ जाएगा?", routeIntro: "उत्तर भारत के शहर चुनें या पास का पता लिखें।", pickup: "पिकअप शहर या पता", dropoff: "डिलीवरी शहर या पता", addressPlaceholder: "शहर चुनें", routeLabel: "अनुमानित रूट", distance: "सड़क किमी", mapPin: "मैप पर पिन", scheduleTitle: "कब तक पहुँचाना है?", scheduleIntro: "लचीली तारीख से कम कीमत मिल सकती है।", pickupDate: "पिकअप की अंतिम तारीख", deliveryDate: "डिलीवरी की अंतिम तारीख", flexible: "लचीला", urgent: "तत्काल", flexibleNote: "लचीले समय से इसी रूट पर जा रहे ट्रक से मिलान आसान होता है और कीमत कम हो सकती है।", urgentNote: "सबसे जल्दी उपलब्ध ट्रक को प्राथमिकता दें।", reviewTitle: "शिपमेंट जाँचें", cargo: "माल", route: "रूट", deadline: "डिलीवरी समय", estimate: "अनुमानित कीमत", priceNote: "अंतिम कीमत ट्रक की उपलब्धता और लोडिंग विवरण पर निर्भर है।", book: "ट्रक ढूँढें", matching: "आपके लिए सही ट्रक ढूँढ रहे हैं…", recommended: "आपके रूट के लिए सबसे अच्छा", reefer: "रेफ्रिजरेटेड", etaPickup: "पिकअप समय", etaDelivery: "डिलीवरी समय", why: "यह मिलान क्यों?", save: "आपकी बचत", dedicated: "समर्पित ट्रक की तुलना में", alternative: "अन्य उपलब्ध ट्रक", cheaper: "कम कीमत · धीमा", faster: "तेज़ · अधिक कीमत", confirm: "बुकिंग पक्की करें", confirmed: "बुकिंग पक्की हुई", bookingId: "बुकिंग आईडी", track: "शिपमेंट ट्रैक करें", rupee: "₹", insurance: "बीमा शामिल", permitNote: "परमिट / एस्कॉर्ट नोट", loose: "खुला थोक माल", bagged: "बोरी में थोक माल", loading: "लोडिंग मदद चाहिए", flexibleShort: "लचीला", urgentShort: "तत्काल", selected: "चुना गया", routeError: "पिकअप और डिलीवरी शहर चुनें।", descriptionError: "माल का छोटा विवरण दें।", dateError: "सही पिकअप और डिलीवरी तारीख चुनें।", useBooking: "डेमो ड्राफ़्ट इसी डिवाइस पर रहेगा।",
  },
} as const;

export const shipperMatchCopy = {
  en: {
    reeferOnly: "Only refrigerated trucks will be considered.", confirmationBody: "Your truck has been reserved for this route.",
    reeferTruck: "Refrigerated 14T truck", mainTruck: "14T Multi-axle truck", driver: "Manpreet Singh · 4.9 ★", pickupEta: "Today · 4:30 PM", deliveryEta: "Tomorrow · 10:00 AM", returnWhy: "This truck is already heading to your destination and has room on its return leg.",
    cheaperTruck: "12T Truck", cheaperDriver: "Sukhdev Kumar · 4.8 ★", cheaperPickup: "Today · 6:10 PM", cheaperDelivery: "Tomorrow · 2:00 PM", cheaperWhy: "A lower-cost truck with a wider pickup window.",
    fasterTruck: "16T Multi-axle", fasterDriver: "Amandeep Gill · 4.9 ★", fasterPickup: "Today · 3:15 PM", fasterDelivery: "Tomorrow · 7:00 AM", fasterWhy: "Earlier pickup and faster delivery availability.",
  },
  hi: {
    reeferOnly: "केवल रेफ्रिजरेटेड ट्रक ही चुने जाएँगे।", confirmationBody: "इस रूट के लिए आपका ट्रक आरक्षित है।",
    reeferTruck: "रेफ्रिजरेटेड 14 टन ट्रक", mainTruck: "14 टन मल्टी-एक्सल ट्रक", driver: "मनप्रीत सिंह · 4.9 ★", pickupEta: "आज · शाम 4:30 बजे", deliveryEta: "कल · सुबह 10:00 बजे", returnWhy: "यह ट्रक आपकी मंज़िल की ओर जा रहा है और वापसी में जगह उपलब्ध है।",
    cheaperTruck: "12 टन ट्रक", cheaperDriver: "सुखदेव कुमार · 4.8 ★", cheaperPickup: "आज · शाम 6:10 बजे", cheaperDelivery: "कल · दोपहर 2:00 बजे", cheaperWhy: "कम कीमत वाला ट्रक और पिकअप का समय थोड़ा लचीला है।",
    fasterTruck: "16 टन मल्टी-एक्सल", fasterDriver: "अमनदीप गिल · 4.9 ★", fasterPickup: "आज · दोपहर 3:15 बजे", fasterDelivery: "कल · सुबह 7:00 बजे", fasterWhy: "जल्दी पिकअप और तेज़ डिलीवरी उपलब्ध।",
  },
} as const;