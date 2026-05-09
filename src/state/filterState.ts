export type ReviewFilters = {
  severity?: string;
  type?: string;
  search?: string;
};

let filters: ReviewFilters = {};

export function getFilters() {
  return filters;
}

export function setSeverityFilter(severity?: string) {
  filters = { ...filters, severity };
}

export function setTypeFilter(type?: string) {
  filters = { ...filters, type };
}

export function setSearchFilter(search?: string) {
  filters = { ...filters, search };
}

export function clearFilters() {
  filters = {};
}
