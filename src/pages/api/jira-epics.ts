import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Retrieve JIRA credentials and domain from request headers
  const JIRA_DOMAIN = req.headers["x-jira-domain"] as string;
  const JIRA_USERNAME = req.headers["x-jira-username"] as string;
  const JIRA_API_TOKEN = req.headers["x-jira-api-token"] as string;

  const projectName = req.query.project as string;

  if (!projectName) {
    return res
      .status(400)
      .json({ error: "Project name is required as a query parameter." });
  }

  if (!JIRA_DOMAIN || !JIRA_USERNAME || !JIRA_API_TOKEN) {
    return res.status(401).json({
      error:
        "JIRA domain, username, and API token are required in the headers.",
    });
  }

  const endpoint = `${JIRA_DOMAIN}/rest/api/2/search`;
  const jql = `issuetype=Epic AND project="${projectName}"`;
  const url = `${endpoint}?jql=${encodeURIComponent(jql)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${JIRA_USERNAME}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
        Accept: "application/json",
      },
    });
    res.status(200).json(response.data.issues);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
}
