import React from "react";
import clsx from "clsx";

import styles from "./HomepageFeatures.module.css";

const FeatureList = [
  {
    description: <>It simplifies your code and greatly improves the readability!</>,
    title: "Decorators",
  },
  {
    description: <>Implement a Discord slash command system easily!</>,
    title: "Slash commands",
  },
  {
    description: (
      <>You can use discord.js alongside discordx without any problems!</>
    ),
    title: "discord.js support",
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
