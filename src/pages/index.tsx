import AuthInput from "@/components/auth-input";
import { Combobox } from "@/components/combobox";
import TicketGraph from "@/components/ticket-graph";
import { apiService } from "@/services/api-service";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";

const Home = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: tickets,
    isError: ticketsError,
    isLoading: ticketsLoading,
  } = useQuery({
    queryKey: ["jiraTickets", selectedProject?.id, selectedEpic?.key],
    queryFn: () =>
      apiService.fetchJiraTickets(selectedProject?.id, selectedEpic.key),
    enabled: !!selectedProject && !!selectedEpic,
  });
  
  const {
    data: epics,
    isError: epicsError,
    isLoading: epicsLoading,
  } = useQuery({
    queryKey: ["jiraEpics", selectedProject?.id],
    queryFn: () => apiService.fetchJiraEpics(selectedProject?.id),
    enabled: !!selectedProject,
  });

  const {
    data: projects,
    isError: projectsError,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["jiraProjects"],
    queryFn: apiService.fetchJiraProjects,
  });

  useEffect(() => {
    if (router.query.project) {
      if (!projects) return;
      setSelectedProject(
        projects.find(
          (project: any) => project.key === (router.query.project as string)
        )
      );
    }
    if (router.query.epic) {
      if (!epics) return;
      setSelectedEpic(
        epics.find((epic: any) => epic.key === (router.query.epic as string))
      );
    }
  }, [router.query, projects, epics]);

  // Update URL when selection changes
  useEffect(() => {
    if (!projects || !epics) return;
    const query = { ...router.query };
    const selectedProjectId = selectedProject?.key;
    const selectedEpicId = selectedEpic?.key;
    if (selectedProjectId) {
      query.project = selectedProjectId;
    } else {
      delete query.project;
    }
    if (selectedEpicId) {
      query.epic = selectedEpicId;
    } else {
      delete query.epic;
    }
    router.replace({ query }, undefined, { shallow: true });
  }, [selectedProject?.key, selectedEpic]);


  const filteredTickets = useMemo(()=>{
    return tickets?.filter(t=> (t.fields.summary.toLowerCase()).includes(searchTerm.toLowerCase()))
  }, [tickets,searchTerm])

  return (
    <div className="flex flex-col gap-4 p-4">
      <AuthInput />
      <div className="flex gap-2">
        {projectsLoading ? (
          <div>Loading projects...</div>
        ) : projectsError ? (
          <div>
            Error fetching projects! (check that your credentials are correct)
          </div>
        ) : (
          <div className="flex flex-col">
            <h2 className="text-lg p-1 font-bold">Project</h2>
            <Combobox
              value={selectedProject ? selectedProject.key : null}
              items={projects.map((project: any) => ({
                label: project.name,
                value: project.key,
              }))}
              onSelect={(selected) => {
                const query = {
                  ...router.query,
                  project: selected,
                  epic: undefined,
                };
                router.push({ query }, undefined, { shallow: true });
              }}
              placeholder="Select a project"
            />
          </div>
        )}

        {selectedProject && (
          <div className="flex flex-col">
            <h2 className="text-lg p-1 font-bold">Epic</h2>
            {epicsLoading ? (
              <div>Loading epics...</div>
            ) : epicsError ? (
              <div>Error fetching epics!</div>
            ) : (
              <Combobox
                value={selectedEpic ? selectedEpic.id : null}
                items={epics.map((epic: any) => ({
                  label: epic.fields.summary,
                  value: epic.id,
                }))}
                onSelect={(selected) =>
                  setSelectedEpic(
                    epics.find((epic: any) => epic.id === selected)
                  )
                }
                placeholder="Select an epic"
              />
            )}
          </div>
        )}
      </div>
      {selectedEpic && (
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">Tickets</h2>
          {ticketsLoading ? (
            <div>Loading tickets...</div>
          ) : ticketsError ? (
            <div>Error fetching tickets!</div>
          ) : (<div className='flex flex-col gap-4'>
            <input className='rounded border-2 w-96 px-2 py-1' onChange={(e)=>setSearchTerm(e.target.value)} value={searchTerm} placeholder='Search tickets by name...'></input>
            {filteredTickets && tickets && <TicketGraph searchFilteredTickets={filteredTickets} tickets={tickets}/>}
            {filteredTickets && <ReadyTickets tickets={filteredTickets} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

export function ReadyTickets({ tickets }: {tickets:Ticket[]}) {
  const findTicketByKey = (key: string) => {
    return tickets.find(ticket => ticket.key === key);
  };

  const isReadyToStart = (ticket: Ticket) => {
    const isStatusTodo = ticket.fields.status.statusCategory.name === 'To Do';

    const isInwardIssuesDone = ticket.fields.issuelinks.every(link => {
      if (!link.inwardIssue) return true;

      const inwardTicket = findTicketByKey(link.inwardIssue.key);
      return inwardTicket
        ? inwardTicket.fields.status.statusCategory.name === 'Done'
        : false;
    });

    return isStatusTodo && (ticket.fields.issuelinks.length === 0 || isInwardIssuesDone);
  };

  const readyTickets = tickets.filter(isReadyToStart);

  return (
    <div className='border-2  p-4'>
      <h2 className="text-lg font-bold mb-4">Tickets ready to start</h2>
      {readyTickets.length > 0 ? (
        <ul className="list-disc list-inside">
          {readyTickets.map(ticket => (
            <li key={ticket.id} className="mt-3 border-b-2 flex justify-between">

              <a 
                href={`${ticket.self.split("rest")[0]}/browse/${ticket.key}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-700"
              >
                {ticket.key} - {ticket.fields.summary}
              </a>
              <div>{ticket.fields.assignee ? ticket.fields.assignee.displayName : <div className='text-green-500'>Unassigned</div>}</div>
         
            </li>
          ))}
        </ul>
      ) : (
        <p>No tickets are ready to start.</p>
      )}
    </div>
  );
}