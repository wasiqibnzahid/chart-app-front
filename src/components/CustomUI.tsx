import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Input,
  Stack,
  Text,
  HStack,
  Icon,
  Select,
} from '@chakra-ui/react';
import { FaEnvelope, FaInfoCircle } from 'react-icons/fa';

function CustomUI() {
  const [date, setDate] = useState('17-Jul-4');
  
  return (
    <Box p={5} borderRadius="md" color="white">
      {/* Checkboxes */}
      <Stack direction="row" spacing={4} align="center" mb={4}>
        <Checkbox defaultIsChecked>Show percentages</Checkbox>
        <Checkbox defaultIsChecked>Show All Data</Checkbox>
        <Checkbox>Show Raw Values</Checkbox>
      </Stack>

      {/* Info Section */}
      <Stack spacing={2} mb={4}>
        <HStack>
          <Icon as={FaInfoCircle} />
          <Text>
            TV Azteca increased moderately by 5% most notably in 25 July to 31 June. fkldjsewiojdfkljcvdksjfieo <br />
            Competition decreased moderately by 5% most notably in 25 July to 31 June.
          </Text>
        </HStack>
      </Stack>

      {/* Input with Icon */}
      <HStack spacing={4}>
        <Icon as={FaEnvelope} />
        <Select value={date} onChange={(e) => setDate(e.target.value)}>
          <option value="17-Jul-4">17-Jul-4</option>
          {/* Add more date options here */}
        </Select>
      </HStack>
    </Box>
  );
}

export default CustomUI;
