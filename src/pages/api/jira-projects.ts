import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Retrieve JIRA credentials and domain from request headers
  const JIRA_DOMAIN = req.headers["x-jira-domain"] as string;
  const JIRA_USERNAME = req.headers["x-jira-username"] as string;
  const JIRA_API_TOKEN = req.headers["x-jira-api-token"] as string;

  if (!JIRA_DOMAIN || !JIRA_USERNAME || !JIRA_API_TOKEN) {
    return res
      .status(401)
      .json({
        error:
          "JIRA domain, username, and API token are required in the headers.",
      });
  }

  const endpoint = `${JIRA_DOMAIN}/rest/api/2/project`;

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${JIRA_USERNAME}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
        Accept: "application/json",
      },
    });
    console.log('successfully fetched projects from jira')
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log('error getting projects from jira')
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
}
