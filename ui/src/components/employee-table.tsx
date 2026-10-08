import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { Employee } from '../model';

type SortKey =
  | 'fullName'
  | 'email'
  | 'jobTitle'
  | 'department'
  | 'hireDate'
  | 'baseMonthlySalary'
  | 'status';

const money = (pounds: number) => `EGP ${pounds.toLocaleString('en-US')}`;

const hiredOn = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const cellSx = {
  fontFamily: '"Roboto", sans-serif',
  fontSize: '0.875rem',
  lineHeight: '1.375rem',
  letterSpacing: 0,
  color: 'text.primary',
  borderColor: '#e6ebf5',
};

const columns: { key: SortKey; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'email', label: 'Email' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'department', label: 'Department' },
  { key: 'hireDate', label: 'Hire date' },
  { key: 'baseMonthlySalary', label: 'Base monthly salary' },
  { key: 'status', label: 'Status' },
];

const sortValue = (employee: Employee, key: SortKey) => {
  if (key === 'status') {
    return employee.status.display;
  }
  if (key === 'hireDate') {
    return new Date(employee.hireDate).getTime();
  }
  if (key === 'baseMonthlySalary') {
    return employee.baseMonthlySalary;
  }
  return employee[key].toLowerCase();
};

type EmployeeTableProps = {
  employees: Employee[];
  isLoading: boolean;
  error?: string;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onCalculateSalary: (employee: Employee) => void;
};

export const EmployeeTable = ({
  employees,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCalculateSalary,
}: EmployeeTableProps) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fullName');
  const [sortAsc, setSortAsc] = useState(true);
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    employee: Employee;
  } | null>(null);

  const closeMenu = () => setMenu(null);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (employees ?? []).filter((employee) => {
      if (query.length === 0) {
        return true;
      }
      return [
        employee.fullName,
        employee.email,
        employee.jobTitle,
        employee.department,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    return filtered.sort((left, right) => {
      const a = sortValue(left, sortKey);
      const b = sortValue(right, sortKey);
      if (a < b) {
        return sortAsc ? -1 : 1;
      }
      if (a > b) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });
  }, [employees, search, sortKey, sortAsc]);

  const sortBy = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((current) => !current);
      return;
    }
    setSortKey(key);
    setSortAsc(true);
  };

  return (
    <>
      <TextField
        placeholder='Search For Full Name, Email, Job Title, Department ...'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size='small'
        sx={{ mb: 2, minWidth: 500 }}
      />
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color='error'>{error}</Typography>}
      {!isLoading && !error && (
        <Paper
          sx={{
            border: '1px solid #e6ebf5',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#eef3fb' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{ ...cellSx, fontWeight: 700, color: 'primary.main' }}
                  >
                    <TableSortLabel
                      active={sortKey === column.key}
                      direction={
                        sortKey === column.key && !sortAsc ? 'desc' : 'asc'
                      }
                      onClick={() => sortBy(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell
                  sx={{ ...cellSx, fontWeight: 700, color: 'primary.main' }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell sx={cellSx}>{employee.fullName}</TableCell>
                  <TableCell sx={cellSx}>{employee.email}</TableCell>
                  <TableCell sx={cellSx}>{employee.jobTitle}</TableCell>
                  <TableCell sx={cellSx}>{employee.department}</TableCell>
                  <TableCell sx={cellSx}>
                    {hiredOn(employee.hireDate)}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    {money(employee.baseMonthlySalary)}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Chip
                      label={employee.status.display}
                      size='small'
                      sx={{
                        fontWeight: 700,
                        bgcolor:
                          employee.status.value === 'active'
                            ? '#e7f6ec'
                            : '#fdecea',
                        color:
                          employee.status.value === 'active'
                            ? '#1e7a3a'
                            : '#c62828',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <IconButton
                      aria-label={`Actions for ${employee.fullName}`}
                      onClick={(event) =>
                        setMenu({ anchor: event.currentTarget, employee })
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={cellSx}>
                    No employees available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menu) {
              onEdit(menu.employee);
            }
            closeMenu();
          }}
        >
          Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) {
              onDelete(menu.employee);
            }
            closeMenu();
          }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) {
              onCalculateSalary(menu.employee);
            }
            closeMenu();
          }}
        >
          Calculate Salary
        </MenuItem>
      </Menu>
    </>
  );
};
