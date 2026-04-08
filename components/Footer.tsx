import { Box, Link, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/nipunsgeeth";

  return (
    <Box
      sx={{
        mt: 3,
        pt: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
        fontSize: "0.75rem",
        color: "text.secondary",
      }}
    >
      <Typography variant="caption" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
        © {currentYear} NipunSGeeTH
        <Link
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <GitHubIcon sx={{ fontSize: "1rem" }} />
        </Link>
        <Link
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          @NipunSGeeTH
        </Link>
      </Typography>
    </Box>
  );
}
