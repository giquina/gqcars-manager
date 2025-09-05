# GitHub Spark Token Management Workflow

## Token Limit Issue Resolution

### Current Problem
- GitHub Spark has 128,000 token limit per session
- ARMORA project exceeded limit at 133,383 tokens
- Mobile apps consume 25-30% more tokens than web apps

### Immediate Solutions

#### 1. Modular Spark Development
Create separate Spark projects for each major feature:

```
ARMORA-Auth (Spark 1)
├── Welcome screen
├── Security questionnaire  
├── User registration/login
└── Profile management

ARMORA-Booking (Spark 2) 
├── Service selection
├── Location picker
├── Price calculator
└── Booking confirmation

ARMORA-Tracking (Spark 3)
├── Real-time map
├── Driver tracking
├── Trip status updates
└── Communication features

ARMORA-Payments (Spark 4)
├── Payment methods
├── Billing/receipts
├── Transaction history
└── Refund handling
```

#### 2. Targeted Edit Strategy
- Use Spark's click-to-edit feature on specific components
- Make single, focused changes per prompt
- Avoid comprehensive feature requests

#### 3. Context Management
- Save revision checkpoints before major changes
- Export to GitHub when approaching token limits
- Start fresh Spark sessions for major architectural changes

### Development Workflow

#### Week 1: Setup Modular Sparks
1. Create 4 separate Spark projects
2. Distribute current screens across relevant Sparks
3. Ensure consistent design system across all Sparks

#### Week 2: Targeted Development
1. Use targeted edits exclusively
2. Test each feature in isolation
3. Validate user flows across Spark projects

#### Week 3: Integration Planning
1. Export working components to GitHub repository
2. Set up React Native project structure
3. Plan integration of Spark prototypes

### Best Practices

#### Dos
✅ Use targeted component edits
✅ Keep prompts focused and specific
✅ Save checkpoints before major changes
✅ Export to GitHub when nearing limits
✅ Test frequently with live preview

#### Don'ts  
❌ Request comprehensive feature additions
❌ Make global styling changes
❌ Add multiple features in single prompt
❌ Ignore token usage warnings
❌ Continue past 120k tokens without exporting

### Emergency Procedures

If you hit token limits:
1. **Immediate**: Save current revision
2. **Export**: Create GitHub repository 
3. **Continue**: Start fresh Spark with essential code only
4. **Integrate**: Combine features in traditional IDE

### Transition to React Native

When ready for mobile app development:
1. Export all Spark prototypes to GitHub
2. Set up React Native development environment
3. Use Spark prototypes as reference for mobile implementation
4. Continue complex features in VS Code/Codespaces

This workflow ensures continuous development while managing Spark's token constraints effectively.