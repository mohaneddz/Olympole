export type ActivityCategory = "collective_sport" | "individual_sport" | "culture";

export type ManagedActivity = {
  slug: string;
  title: string;
  category: ActivityCategory;
  displayOrder: number;
  tableName: string;
};

export const MANAGED_ACTIVITIES: ManagedActivity[] = [
  { slug: "football", title: "Football", category: "collective_sport", displayOrder: 10, tableName: "activity_registrations_football" },
  { slug: "basketball", title: "Basketball", category: "collective_sport", displayOrder: 20, tableName: "activity_registrations_basketball" },
  { slug: "handball", title: "Handball", category: "collective_sport", displayOrder: 30, tableName: "activity_registrations_handball" },
  { slug: "volleyball", title: "Volleyball", category: "collective_sport", displayOrder: 40, tableName: "activity_registrations_volleyball" },
  { slug: "chess", title: "Chess", category: "individual_sport", displayOrder: 10, tableName: "activity_registrations_chess" },
  { slug: "running", title: "Running", category: "individual_sport", displayOrder: 20, tableName: "activity_registrations_running" },
  { slug: "talent-show", title: "Talent Show", category: "culture", displayOrder: 10, tableName: "activity_registrations_talent_show" },
  { slug: "knowledge-cup", title: "Knowledge Cup", category: "culture", displayOrder: 20, tableName: "activity_registrations_knowledge_cup" },
  { slug: "writing-contest", title: "Writing Contest", category: "culture", displayOrder: 30, tableName: "activity_registrations_writing_contest" },
  { slug: "art-exhibition", title: "Drawing & Art", category: "culture", displayOrder: 40, tableName: "activity_registrations_art_exhibition" },
];

const ACTIVITY_BY_SLUG = new Map(MANAGED_ACTIVITIES.map((activity) => [activity.slug, activity]));
const ACTIVITY_BY_TABLE = new Map(MANAGED_ACTIVITIES.map((activity) => [activity.tableName, activity]));

export function getManagedActivityBySlug(slug: string) {
  return ACTIVITY_BY_SLUG.get(slug);
}

export function getManagedActivityByTable(tableName: string) {
  return ACTIVITY_BY_TABLE.get(tableName);
}

export function getAllowedActivityRegistrationTables() {
  return MANAGED_ACTIVITIES.map((activity) => activity.tableName);
}

export function getActivitiesByCategory(category: ActivityCategory) {
  return MANAGED_ACTIVITIES
    .filter((activity) => activity.category === category)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}
