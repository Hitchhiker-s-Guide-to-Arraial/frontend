const recommendationData: { [key: string]: any } = {
  'rec-1': {
    id: 1,
    name: 'Recommendation 1',
    description: 'Detailed information about recommendation 1',
    color: 'blue',
  },
  'rec-2': {
    id: 2,
    name: 'Recommendation 2', 
    description: 'Detailed information about recommendation 2',
    color: 'green',
  },
  'rec-3': {
    id: 3,
    name: 'Recommendation 3',
    description: 'Detailed information about recommendation 3', 
    color: 'purple',
  },
  'rec-4': {
    id: 4,
    name: 'Recommendation 4',
    description: 'Detailed information about recommendation 4',
    color: 'orange',
  },
  'rec-5': {
    id: 5,
    name: 'Recommendation 5',
    description: 'Detailed information about recommendation 5',
    color: 'red',
  },
};

export async function generateStaticParams() {
  return Object.keys(recommendationData).map((slug) => ({
    slug: slug,
  }));
}