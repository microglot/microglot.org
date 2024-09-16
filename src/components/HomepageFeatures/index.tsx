// © 2024 Microglot LLC
//
// SPDX-License-Identifier: CC-BY-SA-4.0

import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
  page?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'IDL',
    Svg: require('@site/static/img/code.svg').default,
    description: (
      <>
        Programming language and runtime agnostic system design tools.
        Compatible with Protocol Buffers.
      </>
    ),
    page: "/docs/idl/intro",
  },
  {
    title: 'Framework',
    Svg: require('@site/static/img/frame.svg').default,
    description: (
      <>
        A polyglot development framework that helps you transition from monolith
        to microservices, microservices to monolith, or anywhere in between
        without rewriting code. <b>*Coming soon*</b>
      </>
    ),
  },
  {
    title: 'Platform',
    Svg: require('@site/static/img/server.svg').default,
    description: (
      <>
        Everything you need to jump start your next software project whether
        its local only, a personal/self-hosted feature, a SaaS startup, or an
        enterprise product. <b>*Coming later*</b>
      </>
    ),
  },
];

function Feature({title, Svg, description, page}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      <a href={page || "#"}>
        <Svg className={styles.featureSvg} role="img" />
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
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
