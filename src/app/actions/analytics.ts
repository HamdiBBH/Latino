"use server";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface GAAnalyticsData {
    isConfigured: boolean;
    analyticsData: {
        visitors: { today: number; trend: string; positive: boolean };
        pageViews: { today: number; trend: string; positive: boolean };
        avgSessionDuration: { value: string; trend: string; positive: boolean };
        bounceRate: { value: string; trend: string; positive: boolean };
    };
    weeklyData: { day: string; visitors: number }[];
    deviceStats: { type: string; percentage: number; color: string }[];
    topPages: { path: string; views: number; percentage: number }[];
    activeRealtime: number;
}

// Fallback Mock Data
const mockData: GAAnalyticsData = {
    isConfigured: false,
    analyticsData: {
        visitors: { today: 342, trend: "+14.8%", positive: true },
        pageViews: { today: 1247, trend: "+14.5%", positive: true },
        avgSessionDuration: { value: "3m 42s", trend: "+8.2%", positive: true },
        bounceRate: { value: "42.3%", trend: "-5.1%", positive: true },
    },
    weeklyData: [
        { day: "Lun", visitors: 245 },
        { day: "Mar", visitors: 312 },
        { day: "Mer", visitors: 287 },
        { day: "Jeu", visitors: 356 },
        { day: "Ven", visitors: 423 },
        { day: "Sam", visitors: 512 },
        { day: "Dim", visitors: 342 },
    ],
    deviceStats: [
        { type: "Mobile", percentage: 62, color: "#E8A87C" },
        { type: "Desktop", percentage: 31, color: "#43B0A8" },
        { type: "Tablet", percentage: 7, color: "#6366F1" },
    ],
    topPages: [
        { path: "/", views: 523, percentage: 42 },
        { path: "/menu", views: 234, percentage: 19 },
        { path: "/reservations", views: 189, percentage: 15 },
        { path: "/gallery", views: 156, percentage: 13 },
        { path: "/contact", views: 145, percentage: 11 },
    ],
    activeRealtime: 23,
};

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m > 0) {
        return `${m}m ${s}s`;
    }
    return `${s}s`;
}

function calculateTrend(current: number, previous: number, isBounceRate = false) {
    if (previous === 0) {
        return { trend: current > 0 ? "+100%" : "0%", positive: !isBounceRate };
    }
    const diff = ((current - previous) / previous) * 100;
    const sign = diff >= 0 ? "+" : "";
    const positive = isBounceRate ? diff <= 0 : diff >= 0;
    return {
        trend: `${sign}${diff.toFixed(1)}%`,
        positive
    };
}

export async function getGoogleAnalyticsData(): Promise<GAAnalyticsData> {
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY;

    if (!propertyId || !clientEmail || !privateKey) {
        console.log("Google Analytics variables are not fully configured in env. Using mock data.");
        return mockData;
    }

    try {
        const client = new BetaAnalyticsDataClient({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
        });

        // 1. Fetch Today's Metrics
        const [todayResponse] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "today", endDate: "today" }],
            metrics: [
                { name: "activeUsers" },
                { name: "screenPageViews" },
                { name: "averageSessionDuration" },
                { name: "bounceRate" }
            ]
        });

        // 2. Fetch Yesterday's Metrics (for trends)
        const [yesterdayResponse] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
            metrics: [
                { name: "activeUsers" },
                { name: "screenPageViews" },
                { name: "averageSessionDuration" },
                { name: "bounceRate" }
            ]
        });

        // 3. Fetch Weekly History (last 7 days including today)
        const [weeklyResponse] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "6daysAgo", endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }],
            orderBys: [{ dimension: { dimensionName: "date" } }]
        });

        // 4. Fetch Devices (last 30 days)
        const [deviceResponse] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "activeUsers" }]
        });

        // 5. Fetch Top Pages (last 30 days)
        const [pagesResponse] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 5
        });

        // 6. Fetch Realtime Users (active in last 30 minutes)
        let activeRealtime = 0;
        try {
            const [realtimeResponse] = await client.runRealtimeReport({
                property: `properties/${propertyId}`,
                metrics: [{ name: "activeUsers" }]
            });
            activeRealtime = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
        } catch (rtErr) {
            console.error("Error fetching GA realtime report:", rtErr);
        }

        // Parse Today
        const todayRow = todayResponse.rows?.[0];
        const tVisitors = parseInt(todayRow?.metricValues?.[0]?.value || "0", 10);
        const tViews = parseInt(todayRow?.metricValues?.[1]?.value || "0", 10);
        const tDurationSec = parseFloat(todayRow?.metricValues?.[2]?.value || "0");
        const tBounceRate = parseFloat(todayRow?.metricValues?.[3]?.value || "0");

        // Parse Yesterday
        const yesterdayRow = yesterdayResponse.rows?.[0];
        const yVisitors = parseInt(yesterdayRow?.metricValues?.[0]?.value || "0", 10);
        const yViews = parseInt(yesterdayRow?.metricValues?.[1]?.value || "0", 10);
        const yDurationSec = parseFloat(yesterdayRow?.metricValues?.[2]?.value || "0");
        const yBounceRate = parseFloat(yesterdayRow?.metricValues?.[3]?.value || "0");

        // Calculate trends
        const visitorsTrend = calculateTrend(tVisitors, yVisitors);
        const viewsTrend = calculateTrend(tViews, yViews);
        const durationTrend = calculateTrend(tDurationSec, yDurationSec);
        const bounceTrend = calculateTrend(tBounceRate, yBounceRate, true);

        // Process Weekly Data
        const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const weeklyData: { day: string; visitors: number; dateStr: string }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
            const dayName = daysOfWeek[d.getDay()];
            weeklyData.push({ dateStr, day: dayName, visitors: 0 });
        }

        if (weeklyResponse.rows) {
            for (const row of weeklyResponse.rows) {
                const dateVal = row.dimensionValues?.[0]?.value || "";
                const val = parseInt(row.metricValues?.[0]?.value || "0", 10);
                const match = weeklyData.find(item => item.dateStr === dateVal);
                if (match) {
                    match.visitors = val;
                }
            }
        }

        // Process Devices
        let totalDeviceUsers = 0;
        const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
        if (deviceResponse.rows) {
            for (const row of deviceResponse.rows) {
                const device = (row.dimensionValues?.[0]?.value || "").toLowerCase();
                const count = parseInt(row.metricValues?.[0]?.value || "0", 10);
                if (device in deviceCounts) {
                    deviceCounts[device] = count;
                } else if (device === "smarttv") {
                    deviceCounts.desktop += count;
                }
                totalDeviceUsers += count;
            }
        }

        const deviceStats = [
            {
                type: "Mobile",
                percentage: totalDeviceUsers > 0 ? Math.round((deviceCounts.mobile / totalDeviceUsers) * 100) : 62,
                color: "#E8A87C",
            },
            {
                type: "Desktop",
                percentage: totalDeviceUsers > 0 ? Math.round((deviceCounts.desktop / totalDeviceUsers) * 100) : 31,
                color: "#43B0A8",
            },
            {
                type: "Tablet",
                percentage: totalDeviceUsers > 0 ? Math.round((deviceCounts.tablet / totalDeviceUsers) * 100) : 7,
                color: "#6366F1",
            },
        ];

        if (totalDeviceUsers > 0) {
            const sum = deviceStats.reduce((s, d) => s + d.percentage, 0);
            if (sum > 0 && sum !== 100) {
                deviceStats[0].percentage += (100 - sum);
            }
        }

        // Process Top Pages
        let totalViewsSum = 0;
        const rawPages: { path: string; views: number }[] = [];
        if (pagesResponse.rows) {
            for (const row of pagesResponse.rows) {
                const path = row.dimensionValues?.[0]?.value || "/";
                const views = parseInt(row.metricValues?.[0]?.value || "0", 10);
                rawPages.push({ path, views });
                totalViewsSum += views;
            }
        }

        const topPages = rawPages.map(page => ({
            path: page.path,
            views: page.views,
            percentage: totalViewsSum > 0 ? Math.round((page.views / totalViewsSum) * 100) : 0
        }));

        if (topPages.length === 0) {
            topPages.push({ path: "/", views: 0, percentage: 100 });
        }

        return {
            isConfigured: true,
            analyticsData: {
                visitors: { today: tVisitors, trend: visitorsTrend.trend, positive: visitorsTrend.positive },
                pageViews: { today: tViews, trend: viewsTrend.trend, positive: viewsTrend.positive },
                avgSessionDuration: { value: formatDuration(tDurationSec), trend: durationTrend.trend, positive: durationTrend.positive },
                bounceRate: { value: `${(tBounceRate * 100).toFixed(1)}%`, trend: bounceTrend.trend, positive: bounceTrend.positive }
            },
            weeklyData: weeklyData.map(({ day, visitors }) => ({ day, visitors })),
            deviceStats,
            topPages,
            activeRealtime
        };
    } catch (error) {
        console.error("Error querying Google Analytics Data API:", error);
        // Return mock data but mark it as not configured/failed
        return {
            ...mockData,
            isConfigured: false
        };
    }
}
