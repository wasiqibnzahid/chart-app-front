import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Input, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const GitRepoAdmin = () => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '1234567') {
      setIsAuthorized(true);
    } else {
      alert('Incorrect PIN');
      navigate('/landing', { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTb5Bpo_pDQX-7z4mBmygAFfNQZie69ez6IqkEpFTg9pbydH3ow2lxia07j67s-65tm1xb2V-ngdXsT/pub?gid=0&single=true&output=csv';
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setIsLoading(false);
        },
        error: (err) => {
          console.error('Error fetching CSV:', err);
          setError('Failed to fetch data.');
          setIsLoading(false);
        },
      });
    }
  }, [isAuthorized]);

  const processedData = useMemo(() => {
    return csvData.map((row) => ({
      date: row['Date']?.trim(),
      developer: row['Developer']?.trim(),
      category: row['Category']?.trim(),
      createdAt: Number(row['Created At']),
      openPRs: Number(row['Open PRs']),
      mergedAt: Number(row['Merged At']),
      sDevelopment: Number(row['S_DEVELOPMENT Count']),
      sCodeReview: Number(row['S_CODE_REVIEW Count']),
      sQA: Number(row['S_QA Count']),
      sUAT: Number(row['S_UAT Count']),
    })).filter((row) => row.date);
  }, [csvData]);

  const chartData = useMemo(() => {
    const labels = Array.from(new Set(processedData.map((row) => row.date))).sort((a, b) => new Date(a) - new Date(b));
    const datasets = [
      {
        label: 'Created At',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.createdAt, 0)),
        backgroundColor: '#f72585',
      },
      {
        label: 'Merged At',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.mergedAt, 0)),
        backgroundColor: '#7209b7',
      },
      {
        label: 'S_DEVELOPMENT',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.sDevelopment, 0)),
        backgroundColor: '#3a0ca3',
      },
      {
        label: 'S_CODE_REVIEW',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.sCodeReview, 0)),
        backgroundColor: '#4361ee',
      },
      {
        label: 'S_QA',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.sQA, 0)),
        backgroundColor: '#4cc9f0',
      },
      {
        label: 'S_UAT',
        data: labels.map((date) => processedData.filter((row) => row.date === date).reduce((acc, row) => acc + row.sUAT, 0)),
        backgroundColor: '#4895ef',
      },
    ];
    return { labels, datasets };
  }, [processedData]);

  if (!isAuthorized) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        bg="linear-gradient(90deg, #000000, #7800ff)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        zIndex="1000"
      >
        <form onSubmit={handlePinSubmit}>
          <VStack spacing={4}>
            <Text fontSize="xl">Enter PIN to Access Git Repo Admin</Text>
            <Input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              width="300px"
              textAlign="center"
            />
            <Button type="submit" colorScheme="teal">
              Submit
            </Button>
          </VStack>
        </form>
      </Box>
    );
  }

  return (
    <Box width="100vw" height="100vh" m={0} p={0} bg="linear-gradient(90deg, #000000, #7800ff)" color="white" p={4}>
      {isLoading ? (
        <Text>Loading data...</Text>
      ) : error ? (
        <Text color="red.300">{error}</Text>
      ) : (
        <>
          <Text fontSize="2xl" mb={4} fontWeight="bold">
            Desarroladores Performance Over Time
          </Text>
          <Box mb={6} border="1px solid white" borderRadius="md" p={2} width="100%" minH="400px" height="400px">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: 'white' } },
                },
                scales: {
                  x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.3)' },
                  },
                  y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.3)' } },
                },
              }}
            />
          </Box>
          <Box overflowX="auto">
            <Table variant="simple" color="white">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Developer</Th>
                  <Th>Category</Th>
                  <Th isNumeric>Created At</Th>
                  <Th isNumeric>Open PRs</Th>
                  <Th isNumeric>Merged At</Th>
                  <Th isNumeric>S_DEVELOPMENT</Th>
                  <Th isNumeric>S_CODE_REVIEW</Th>
                  <Th isNumeric>S_QA</Th>
                  <Th isNumeric>S_UAT</Th>
                </Tr>
              </Thead>
              <Tbody>
                {processedData.map((row, index) => (
                  <Tr key={index}>
                    <Td>{row.date}</Td>
                    <Td>{row.developer}</Td>
                    <Td>{row.category}</Td>
                    <Td isNumeric>{row.createdAt}</Td>
                    <Td isNumeric>{row.openPRs}</Td>
                    <Td isNumeric>{row.mergedAt}</Td>
                    <Td isNumeric>{row.sDevelopment}</Td>
                    <Td isNumeric>{row.sCodeReview}</Td>
                    <Td isNumeric>{row.sQA}</Td>
                    <Td isNumeric>{row.sUAT}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export default GitRepoAdmin;
