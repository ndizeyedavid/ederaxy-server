export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
};

export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
};

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const EDUCATION_STAGES = {
  PRE_PRIMARY: "pre_primary",
  LOWER_PRIMARY: "lower_primary",
  UPPER_PRIMARY: "upper_primary",
  ORDINARY_LEVEL: "ordinary_level",
  ADVANCED_LEVEL: "advanced_level",
  UNIVERSITY: "university",
};

export const EDUCATION_STAGE_LABELS = {
  [EDUCATION_STAGES.PRE_PRIMARY]: "Pre-Primary",
  [EDUCATION_STAGES.LOWER_PRIMARY]: "Lower Primary",
  [EDUCATION_STAGES.UPPER_PRIMARY]: "Upper Primary",
  [EDUCATION_STAGES.ORDINARY_LEVEL]: "Ordinary Level",
  [EDUCATION_STAGES.ADVANCED_LEVEL]: "Advanced Level",
  [EDUCATION_STAGES.UNIVERSITY]: "University",
};

export const CLASS_COMBINATION_TYPES = {
  SCIENCE: "science",
  ARTS: "arts",
  TECHNOLOGY: "technology",
  GENERAL: "general",
};

export default {
  USER_ROLES,
  TOKEN_TYPES,
  OBJECT_ID_REGEX,
  EDUCATION_STAGES,
  EDUCATION_STAGE_LABELS,
  CLASS_COMBINATION_TYPES,
};
