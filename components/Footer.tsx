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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
        <Typography variant="caption">© {currentYear} </Typography>
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
      </Box>
      <Typography variant="caption">
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
