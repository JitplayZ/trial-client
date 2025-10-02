import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, CreditCard } from 'lucide-react';

const DashboardCards = () => {
  const cards = [
    {
      title: 'Projects Generated',
      value: '12',
      icon: FolderOpen,
      description: 'Total projects created',
      trend: '+2 this week'
    },
    {
      title: 'Free Credits',
      value: '8',
      icon: CreditCard,
      description: 'Remaining credits',
      trend: '2 used today'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <p className="text-xs text-accent mt-1">
                {card.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardCards;