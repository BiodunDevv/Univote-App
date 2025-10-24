import { AnimatedTabBar } from "@/components/tab/AnimatedTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          title: "Vote",
        }}
      />
      <Tabs.Screen
        name="my-votes"
        options={{
          title: "My Votes",
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Results",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
