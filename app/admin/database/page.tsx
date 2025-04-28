"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TableData {
  name: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
}

interface ApiResponse {
  success: boolean;
  tables?: TableData[];
  error?: string;
}

interface QueryResult {
  [key: string]: string | number | null;
}

export default function DatabaseInspector() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [query, setQuery] = useState<string>("");
  const [queryResult, setQueryResult] = useState<QueryResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchTables() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/database/tables");
        const data: ApiResponse = await response.json();

        if (data.success && data.tables) {
          setTables(data.tables);
        } else {
          setError(data.error || "Failed to fetch tables");
        }
      } catch (err) {
        setError("An error occurred while fetching tables");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTables();
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        setQueryResult(data.results);
        setError(null);
      } else {
        setError(data.error || "Failed to execute query");
        setQueryResult(null);
      }
    } catch (err) {
      setError("An error occurred while executing query");
      setQueryResult(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && tables.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Inspector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <p>Loading database tables...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && tables.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Inspector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tables">
            <TabsList>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="query">Custom Query</TabsTrigger>
            </TabsList>

            <TabsContent value="tables">
              <div className="mt-4">
                <div className="mb-4">
                  <Input
                    placeholder="Search tables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {filteredTables.length === 0 ? (
                  <p>No tables found matching &ldquo;{searchTerm}&rdquo;</p>
                ) : (
                  filteredTables.map((table) => (
                    <div key={table.name} className="mb-8">
                      <h3 className="text-lg font-medium mb-2">{table.name}</h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {table.columns.map((column) => (
                                <th
                                  key={column}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {table.rows.map((row, idx) => (
                              <tr key={idx}>
                                {table.columns.map((column) => (
                                  <td
                                    key={`${idx}-${column}`}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {row[column] !== null
                                      ? String(row[column])
                                      : "NULL"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="query">
              <div className="mt-4">
                <div className="mb-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={5}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter SQL query..."
                  />
                  <Button onClick={executeQuery} className="mt-2">
                    Execute
                  </Button>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {queryResult && (
                  <div className="overflow-x-auto">
                    {queryResult.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(queryResult[0]).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queryResult.map((row, idx) => (
                            <tr key={idx}>
                              {Object.entries(row).map(([key, value]) => (
                                <td
                                  key={`${idx}-${key}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  {value !== null ? String(value) : "NULL"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>Query executed successfully. No results returned.</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
