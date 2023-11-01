import React from "react";
import { Button } from "./ui/button";

const AuthInput = () => {
  const handleAuth = () => {
    // Get existing credentials or set default values
    const currentDomain = localStorage.getItem("jiraDomain") || "";
    const currentUsername = localStorage.getItem("jiraUsername") || "";
    const currentToken = localStorage.getItem("jiraToken") || "";

    // Prompt for new values, using existing ones as defaults
    const domain = prompt("Enter JIRA Domain:", currentDomain) || currentDomain;
    const username =
      prompt("Enter JIRA Username:", currentUsername) || currentUsername;
    const token = prompt("Enter JIRA API Token:", currentToken) || currentToken;

    // Set the new values in local storage
    localStorage.setItem("jiraDomain", domain);
    localStorage.setItem("jiraUsername", username);
    localStorage.setItem("jiraToken", token);

    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-1">
      <a
        className="underline cursor-pointer text-blue-400"
        href="https://docs.searchunify.com/Content/Content-Sources/Atlassian-Jira-Confluence-Authentication-Create-API-Token.htm"
      >
        How to get a jira api token?
      </a>
      <div>
        <Button onClick={handleAuth}>Set JIRA Credentials</Button>
      </div>
    </div>
  );
};

export default AuthInput;
