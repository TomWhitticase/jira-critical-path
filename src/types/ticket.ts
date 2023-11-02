type Ticket = {
  id: string;
  self: string;
  key: string;
  fields: {
    key: string;
    summary: string;
    url: string;
    assignee? :{
      displayName: string;
    };
    labels: string[];
    issuelinks: Array<{
      type: {
        name: string;
      };
      outwardIssue?: {
        key: string;
      };
      inwardIssue?: {
        key: string;
      };
    }>;
    status: {
      statusCategory: {
        name: string;
        colorName: string;
      };
    };
  };
};