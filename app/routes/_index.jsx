import exams from "../assets/exam_2627.json";
import { Container, Link, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function Home() {
    const tableRef = useRef(null);
    const [positioned, setPositioned] = useState(false);
    const now = new Date(Date.now() + 8 * 60 * 60_000);
    const rows = exams.flatMap(slot => slot.modules.map(module => {
        return {
            id: `${slot.examDate}-${module.moduleCode}`,
            start: new Date(`${slot.examDate}Z`),
            end: new Date(new Date(`${slot.examDate}Z`).getTime() + slot.examDuration * 60_000),
            code: module.moduleCode,
            name: module.title
        };
    }));
    const dateFormat = new Intl.DateTimeFormat("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    const timeFormat = new Intl.DateTimeFormat("en-SG", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });

    useEffect(() => {
        const nextExam = rows.find(row => row.end >= now);
        if (!nextExam) {
            setPositioned(true);
            return;
        }

        const container = tableRef.current;
        const target = container.querySelector(`[data="${nextExam.id}"]`);
        const header = container.querySelector("thead th");
        container.scrollTop += target.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
        setPositioned(true);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Typography component="h1" color="text.primary" variant="h4" sx={{ fontWeight: 700, my: 2 }}>
                NUS Exam Time Table
            </Typography>
            <Typography component="h2" color="text.secondary">
                NUS exam dates for AY 2026 / 2027.
            </Typography>
            <List aria-label="Legend" sx={{ display: "flex", flexWrap: "wrap", fontWeight: 700 }}>
                <ListItem sx={{ width: "auto", color: "success.dark" }}>● Soon</ListItem>
                <ListItem sx={{ width: "auto", color: "warning.dark" }}>● Next</ListItem>
                <ListItem sx={{ width: "auto", color: "error.dark" }}>● Started</ListItem>
                <ListItem sx={{ width: "auto", color: "info.dark" }}>● Ended</ListItem>
            </List>

            <TableContainer aria-label="Time table" ref={tableRef} component={Paper} sx={{ height: "66vh", border: 1, borderColor: "divider", borderRadius: 3, visibility: positioned ? "visible" : "hidden" }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: "20%", minWidth: 80 }}>Date</TableCell>
                            <TableCell sx={{ width: "10%", minWidth: 70 }}>Start</TableCell>
                            <TableCell sx={{ width: "10%", minWidth: 70 }}>End</TableCell>
                            <TableCell sx={{ width: "15%", minWidth: 80 }}>Code</TableCell>
                            <TableCell sx={{ width: "45%", minWidth: 500 }}>Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{rows.map(row => {
                        const parts = Object.fromEntries(dateFormat.formatToParts(row.start).map(({ type, value }) => [type, value]));
                        const rowColor = row.start.toISOString().slice(0, 10) < now.toISOString().slice(0, 10) ? "text.disabled"
                            : row.start.toISOString().slice(0, 10) > now.toISOString().slice(0, 10) ? "text.primary"
                                : row.end <= now ? "info.dark"
                                    : row.start <= now ? "error.dark"
                                        : (row.start - now) / 60_000 <= 30 ? "warning.dark"
                                            : "success.dark";
                        const rowWeight = rowColor.includes("text") ? 400 : 700;
                        return (
                            <TableRow hover key={row.id} data={row.id}>
                                <TableCell sx={{ color: rowColor, display: { xs: "table-cell", md: "none" }, fontWeight: rowWeight }}>
                                    {`${parts.day} ${parts.month}`}
                                </TableCell>
                                <TableCell sx={{ color: rowColor, display: { xs: "none", md: "table-cell" }, fontWeight: rowWeight }}>
                                    {`${parts.day} ${parts.month} ${parts.year} (${parts.weekday})`}
                                </TableCell>
                                <TableCell sx={{ color: rowColor, fontWeight: rowWeight }}>{timeFormat.format(row.start)}</TableCell>
                                <TableCell sx={{ color: rowColor, fontWeight: rowWeight }}>{timeFormat.format(row.end)}</TableCell>
                                <TableCell>
                                    <Link href={`https://nusmods.com/courses/${row.code}`} sx={{ color: rowColor, fontWeight: rowWeight }}>{row.code}</Link>
                                </TableCell>
                                <TableCell sx={{ color: rowColor, fontWeight: rowWeight }}>{row.name}</TableCell>
                            </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}