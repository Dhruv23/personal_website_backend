'use server';

import { GitHubRepo } from '../types/config';

const GITHUB_PAT = process.env.GITHUB_PAT;

export interface GitHubStatsData {
  contributions: number;
  stars: number;
  topLanguages: { name: string; color: string; percentage: number }[];
}

export async function getGitHubStats(username: string): Promise<GitHubStatsData | null> {
  if (!GITHUB_PAT) {
    console.error("GITHUB_PAT is missing");
    return null;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            stargazers {
              totalCount
            }
            languages(first: 1, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 }
    });

    const { data } = await res.json();
    if (!data || !data.user) return null;

    const contributions = data.user.contributionsCollection.contributionCalendar.totalContributions;

    let totalStars = 0;
    const languageCounts: Record<string, { count: number; color: string }> = {};

    data.user.repositories.nodes.forEach((repo: any) => {
      totalStars += repo.stargazers.totalCount;
      if (repo.languages.edges.length > 0) {
        const lang = repo.languages.edges[0].node;
        if (!languageCounts[lang.name]) {
          languageCounts[lang.name] = { count: 0, color: lang.color };
        }
        languageCounts[lang.name].count++;
      }
    });

    const totalRepos = data.user.repositories.nodes.length;
    const topLanguages = Object.entries(languageCounts)
      .map(([name, { count, color }]) => ({
        name,
        color,
        percentage: Math.round((count / totalRepos) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    return {
      contributions,
      stars: totalStars,
      topLanguages
    };

  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
    if (!GITHUB_PAT) {
        console.error("GITHUB_PAT is missing");
        return [];
    }

    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
            headers: {
                Authorization: `Bearer ${GITHUB_PAT}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) return [];

        const repos = await res.json();
        return repos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            hidden: false,
            order: 0
        }));
    } catch (error) {
        console.error("Error fetching repos:", error);
        return [];
    }
}
