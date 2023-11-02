import React, { useCallback, useState } from "react";
import Mermaid from "./mermaid";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

type TicketGraph = {
  tickets: Ticket[];
  searchFilteredTickets: Ticket[];
};

const TicketGraph: React.FC<TicketGraph> = ({ tickets, searchFilteredTickets }) => {
  const [width, setWidth] = useState(1000);
  const [showOnlyBlocking, setShowOnlyBlocking] = useState(false);

  const wrapText = (text: string, maxLength: number) => {
    let wrappedText = "";
    let line = "";

    text.split(" ").forEach((word) => {
      if ((line + word).length > maxLength) {
        wrappedText += line.trim() + "\n";
        line = "";
      }
      line += word + " ";
    });

    if (line) {
      wrappedText += line.trim();
    }

    return wrappedText;
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "in progress":
        return "rgba(131, 168, 234, 0.7)";
      case "done":
        return "rgba(107, 194, 123, 0.7)";
      case "to do":
        return "rgba(183, 156, 220, 0.7)";
      case "in review":
        return "rgba(233, 208, 102, 0.7)";
      default:
        return "rgba(178, 184, 191, 0.7)";
    }
  };
  const generateMermaid = useCallback(
    (tickets: Ticket[]) => {
      const filteredTickets = showOnlyBlocking
        ? tickets.filter((ticket) => ticket.fields.issuelinks.length)
        : tickets;

      let graph = "graph TB;\n";


      filteredTickets.forEach((ticket) => {
        const nodeLabel = `
    <a href="${ticket.self.split("rest")[0]}/browse/${
          ticket.key
        }" target="_blank">
      <div style='border: ${searchFilteredTickets.length !== filteredTickets.length && searchFilteredTickets.includes(ticket) ? '5px solid red' : 'none'}'>
        <h3 style='font-size: 3rem; color: #333;'>${ticket.key}</h3>
        <p style='font-size: 2rem; color: #666;'>${wrapText(
          ticket.fields.summary,
          40
        )}</p>
        <h3 style='font-size: 3rem;background-color: ${getStatusColor(
          ticket.fields.status.statusCategory.name
        )};color: #fff;border-radius: 4px;padding: 4px;text-align: center;
        '>${ticket.fields.status.statusCategory.name}</h3>
      </div>
    </a>`;
        graph += `${ticket.key}["${nodeLabel}"];\n`;
      });

      filteredTickets.forEach((ticket) => {
        ticket.fields.issuelinks?.forEach((link) => {
          const linkType = link.type.name;
          let sourceKey, targetKey;
          sourceKey = ticket.key;
          targetKey = link.outwardIssue?.key;
    
          // switch (linkType) {
          //   case "Blocks":
          //     sourceKey = ticket.key;
          //     targetKey = link.outwardIssue?.key;
          //     break;
          //   case "Depends On":
          //     sourceKey = link.inwardIssue?.key;
          //     targetKey = ticket.key;
          //     break;
          //   case "Related To":
          //     sourceKey = ticket.key;
          //     targetKey = link.outwardIssue?.key;
          //     break;
          //   // Add more cases as needed
          // }
    
          if (sourceKey && targetKey) {
            graph += `${sourceKey} -->|${linkType}| ${targetKey};\n`;
          }
        });
      });
    
      // Add style for edges
      // graph += `linkStyle default stroke:#999,stroke-width:2px,fill:none;\n`;
      // graph += `linkStyle 0 stroke:#f66,stroke-width:2px;\n`; // Style for 'Blocks' edges
      // graph += `linkStyle 1 stroke-dasharray: 5 5,stroke:#6a6;\n`; // Style for 'Depends On' edges
      // graph += `linkStyle 2 stroke-dasharray: 5 5,stroke:#82b;\n`; // Style for 'Related To' edges
    

      if (filteredTickets.length === 0)
        return 'graph TB;\nNoTickets["No tickets to show"]';

      return graph;
    },
    [searchFilteredTickets, showOnlyBlocking]
  );

  const mermaidRaw = generateMermaid(tickets);

  return (
    <div>
      <div className="flex gap-4 p-2">
        <Button onClick={() => setWidth((prev) => prev * 1.5)}>+</Button>
        <Button onClick={() => setWidth((prev) => prev / 1.5)}>-</Button>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={showOnlyBlocking}
            onCheckedChange={(value) => setShowOnlyBlocking(value as boolean)}
            id="checkbox"
          />
          <label
            htmlFor="checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Only show blocking/blocked tickets
          </label>
        </div>
      </div>
      <div className="overflow-auto">
        <div className="border-2 rounded p-4" style={{ width, height: "auto" }}>
          <Mermaid key={mermaidRaw} chart={mermaidRaw} />
        </div>
      </div>
    </div>
  );
};

export default TicketGraph;
