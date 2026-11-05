import type {
  OpportunitySource,
  OpportunityStage,
  OpportunityStatus,
} from "@/generated/prisma/enums";

export type OpportunityFilters = {
  search?: string;
  etapa?: OpportunityStage;
  origen?: OpportunitySource;
  responsableId?: string;
  comuna?: string;
  estado?: OpportunityStatus;
  desde?: Date;
  hasta?: Date;
};

export type OpportunityFormState = {
  error?: string;
  message?: string;
};
