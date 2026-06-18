export interface GetTeamReportRequest {
  Params: { teamId: string };
  Querystring: {
    status?: string;
    priority?: string;
    assigneeId?: string;
  };
}
