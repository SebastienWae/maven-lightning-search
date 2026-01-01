import { FileArrowDownIcon, MagnifyingGlassIcon, RssSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const activeTab = location.pathname === "/instructors" ? "instructors" : "talks";

  return (
    <Tabs value={activeTab} className="w-full flex-col justify-start gap-2 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger
            value="talks"
            render={
              <Link
                to="/talks"
                search={{
                  page: 1,
                  limit: 10,
                  sortBy: "startTime",
                  sortOrder: "desc",
                  search: "",
                  tags: [],
                  instructors: [],
                  status: [],
                }}
              />
            }
            nativeButton={false}
          >
            Talks
          </TabsTrigger>
          <TabsTrigger value="instructors" render={<Link to="/instructors" />} nativeButton={false}>
            Instructors
          </TabsTrigger>
        </TabsList>
        <div className="flex irtems-center gap-2">
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
          </InputGroup>
          <ButtonGroup>
            <Button variant="outline">
              <FileArrowDownIcon />
            </Button>
            <Button variant="outline">
              <RssSimpleIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <Outlet />
    </Tabs>
  );
}
