import axios from "axios";

const getJiraHeaders = () => {
  // Read credentials from local storage
  const JIRA_DOMAIN = localStorage.getItem('jiraDomain') || 'default_domain';
  const JIRA_USERNAME = localStorage.getItem('jiraUsername') || 'default_username';
  const JIRA_API_TOKEN = localStorage.getItem('jiraToken') || 'default_token';

  return {
    'x-jira-domain': JIRA_DOMAIN,
    'x-jira-username': JIRA_USERNAME,
    'x-jira-api-token': JIRA_API_TOKEN,
  };
};

export const apiService = {
  fetchJiraTickets: async (projectId: string, epicId: string) => {
    const headers = getJiraHeaders();
    const { data } = await axios.get(`/api/jira-tickets?project=${projectId}&epic=${epicId}`, { headers });
    return data;
  },

  fetchJiraEpics: async (projectId: string) => {
    const headers = getJiraHeaders();
    const { data } = await axios.get(`/api/jira-epics?project=${projectId}`, { headers });
    return data;
  },

  fetchJiraProjects: async () => {
    const headers = getJiraHeaders();
    const { data } = await axios.get("/api/jira-projects", { headers });
    return data;
  },
};
