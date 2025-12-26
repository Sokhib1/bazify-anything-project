/**
 * Business hours utility functions
 */

const DAYS_UZ = {
  monday: "Dushanba",
  tuesday: "Seshanba",
  wednesday: "Chorshanba",
  thursday: "Payshanba",
  friday: "Juma",
  saturday: "Shanba",
  sunday: "Yakshanba",
};

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Get current day of week in English (lowercase)
 */
export function getCurrentDay() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date().getDay();
  return days[today];
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Check if store is currently open
 */
export function isStoreOpen(businessHours) {
  if (!businessHours) return true; // If no hours set, assume open

  const currentDay = getCurrentDay();
  const currentTime = getCurrentTime();
  const todayHours = businessHours[currentDay];

  if (!todayHours || todayHours.closed) {
    return false;
  }

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Get store status text
 */
export function getStoreStatus(businessHours) {
  if (!businessHours) return { isOpen: true, text: "" };

  const currentDay = getCurrentDay();
  const currentTime = getCurrentTime();
  const todayHours = businessHours[currentDay];

  if (!todayHours || todayHours.closed) {
    return {
      isOpen: false,
      text: `Bugun yopiq (${DAYS_UZ[currentDay]})`,
    };
  }

  const isOpen =
    currentTime >= todayHours.open && currentTime <= todayHours.close;

  if (isOpen) {
    return {
      isOpen: true,
      text: `Ochiq (${todayHours.close} gacha)`,
    };
  } else if (currentTime < todayHours.open) {
    return {
      isOpen: false,
      text: `Yopiq (${todayHours.open} da ochiladi)`,
    };
  } else {
    return {
      isOpen: false,
      text: `Yopiq (Ertaga ${todayHours.open} da ochiladi)`,
    };
  }
}

/**
 * Format business hours for display
 */
export function formatBusinessHours(businessHours) {
  if (!businessHours) return "";

  const closedDays = [];
  const workingDays = [];

  DAYS_ORDER.forEach((day) => {
    const hours = businessHours[day];
    if (!hours || hours.closed) {
      closedDays.push(DAYS_UZ[day]);
    } else {
      workingDays.push({
        day: DAYS_UZ[day],
        hours: `${hours.open}-${hours.close}`,
      });
    }
  });

  // Group consecutive days with same hours
  const grouped = [];
  let currentGroup = null;

  workingDays.forEach((item, index) => {
    if (!currentGroup) {
      currentGroup = { start: item.day, end: item.day, hours: item.hours };
    } else if (currentGroup.hours === item.hours) {
      currentGroup.end = item.day;
    } else {
      grouped.push(currentGroup);
      currentGroup = { start: item.day, end: item.day, hours: item.hours };
    }

    if (index === workingDays.length - 1) {
      grouped.push(currentGroup);
    }
  });

  const hoursText = grouped
    .map((g) => {
      if (g.start === g.end) {
        return `${g.start}: ${g.hours}`;
      }
      return `${g.start}-${g.end}: ${g.hours}`;
    })
    .join(", ");

  if (closedDays.length > 0) {
    return `${hoursText} (Dam olish: ${closedDays.join(", ")})`;
  }

  return hoursText;
}

/**
 * Get default business hours
 */
export function getDefaultBusinessHours() {
  return {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "18:00", closed: false },
    sunday: { open: "00:00", close: "00:00", closed: true },
  };
}

export { DAYS_UZ, DAYS_ORDER };
