# Suggested Content Algorithm

This document outlines the algorithm for generating suggested content across Videos, Posts, Bitz, and Trending sections of the Lambrk platform.

## Overview

The suggested content algorithm provides personalized recommendations to users based on multiple weighted factors including user behavior, content engagement metrics, recency, and similarity. The algorithm works across all content types: Videos, Posts, Bitz, and Trending content.

### Mathematical Foundation

The recommendation problem can be formally defined as:

Given:
- Content set: C = {c₁, c₂, ..., cₙ} where n is the total number of content items
- User set: U = {u₁, u₂, ..., uₘ} where m is the total number of users
- User-content interaction matrix: R ∈ ℝ^(m×n) where Rᵢⱼ represents user i's interaction with content j
- Feature vectors: F(c) for each content item c ∈ C

Find: Top-k content items for user u that maximize the recommendation score S(u, c)

The problem is essentially a **weighted multi-objective optimization problem** where we maximize:

**S(u, c) = w₁·E(c) + w₂·R(c, t) + w₃·Rel(u, c) + w₄·Q(c)**

Subject to constraints:
- w₁ + w₂ + w₃ + w₄ = 1 (weight normalization)
- wᵢ ≥ 0 for all i (non-negative weights)
- c ∉ H(u) (exclude user's history)

## Algorithm Components

### 1. Content Scoring System

Each piece of content receives a final score calculated from four weighted components:

#### Base Score Formula

**Final Score = (Engagement Score × 0.40) + (Recency Score × 0.25) + (Relevance Score × 0.20) + (Quality Score × 0.15)**

In mathematical notation:

**S(c, u, t) = wₑ·E(c) + wᵣ·R(c, t) + wₗ·L(u, c) + wq·Q(c)**

Where:
- S(c, u, t): Final score for content c, user u, at time t
- E(c): Engagement score function
- R(c, t): Recency score function (time-dependent)
- L(u, c): Relevance/likelihood score function (user-content dependent)
- Q(c): Quality score function
- wₑ = 0.40, wᵣ = 0.25, wₗ = 0.20, wq = 0.15 (weights)

**Constraint**: wₑ + wᵣ + wₗ + wq = 1 (weight normalization)

This is a **linear combination** of four independent scoring functions, making it a **weighted linear model**.

#### Score Components

1. **Engagement Score (40% weight)**
   - Measures how much users interact with the content
   - Factors include:
     - Total views count
     - Likes to dislikes ratio
     - Comments count
     - Shares count
     - Watch time percentage (for videos)
     - Content completion rate

2. **Recency Score (25% weight)**
   - Measures how recently the content was published
   - Uses exponential decay: newer content gets higher scores
   - Factors include:
     - Time since publication
     - Recent engagement velocity (how fast it's gaining views)
     - Trending momentum indicator

3. **Relevance Score (20% weight)**
   - Measures how relevant the content is to the specific user
   - Factors include:
     - User's viewing history
     - Subscribed channels or followed authors
     - Content category preferences
     - Similar content interactions
     - Current content context (same channel/author boost)

4. **Quality Score (15% weight)**
   - Measures the overall quality and reputation of the content
   - Factors include:
     - Content creator's average engagement rate
     - Historical performance of similar content
     - User feedback and ratings
     - Production quality indicators

## Content Type Specific Algorithms

### Video Suggestions Algorithm

#### Step 1: Calculate Engagement Score

**Engagement Score = (Views / 1,000,000) × 0.40**

Where:
- Views are converted from string format (e.g., "1.2M views" → 1,200,000)
- Normalized by dividing by 1 million to get a 0-1 scale
- Multiplied by 0.40 weight

#### Step 2: Calculate Recency Score

**Recency Score = Recency Value × 0.25**

Recency Value calculation:
- If published < 1 hour ago: 1.0
- If published < 24 hours ago: 0.9 - (hours / 240)
- If published < 7 days ago: 0.7 - ((hours - 24) / 1440)
- If published < 30 days ago: 0.5 - ((hours - 168) / 11040)
- If published > 30 days ago: 0.1

#### Step 3: Calculate Relevance Score

**Relevance Score = Relevance Value × 0.20**

Relevance Value calculation:
- Start with base value: 0
- If user is subscribed to video's channel: +0.15
- If video is in user's watch history: -0.05 (penalty to avoid duplicates)
- If current video is from same channel: +0.05 (boost for related content)
- Final value is multiplied by 0.20 weight

#### Step 4: Calculate Quality Score

**Quality Score = Quality Value × 0.15**

Quality Value calculation:
- Based on like/dislike ratio: (Likes / (Likes + Dislikes + 1))
- Normalized to 0-1 scale
- Multiplied by 0.15 weight

#### Step 5: Calculate Final Score and Rank

**Final Video Score = Engagement + Recency + Relevance + Quality**

#### Step 6: Filtering

Exclude videos that:
- Match the currently watching video ID
- Are in the user's recent watch history (last 20 videos)

#### Step 7: Selection

- Sort all remaining videos by Final Score (descending)
- Select top 20 videos with highest scores
- Return as suggested videos

### Post Suggestions Algorithm

#### Step 1: Calculate Engagement Score

**Engagement Score = ((Likes × 0.3) + (Comments × 0.2) + (Shares × 0.1) + (Engagement Ratio × 1000 × 0.4)) / 10,000 × 0.40**

Where:
- Engagement Ratio = (Likes - Dislikes) / (Likes + Dislikes + 1)
- Each component is weighted and normalized
- Final value multiplied by 0.40 weight

#### Step 2: Calculate Recency Score

**Recency Score = Recency Value × 0.25**

Uses same recency calculation as videos (exponential decay based on time since publication)

#### Step 3: Calculate Relevance Score

**Relevance Score = Relevance Value × 0.20**

Relevance Value calculation:
- Start with base value: 0
- If user follows the post author: +0.15
- If post is in user's liked posts: -0.10 (penalty)
- If post is in user's commented posts: -0.05 (penalty)
- Final value multiplied by 0.20 weight

#### Step 4: Calculate Quality Score

**Quality Score = Quality Value × 0.15**

Quality Value calculation:
- Like ratio component: (Likes / (Likes + Dislikes + 1)) × 0.5
- Comments component: If comments > 100, use 0.3, else (Comments / 333)
- Shares component: If shares > 50, use 0.2, else (Shares / 250)
- Sum of components multiplied by 0.15 weight

#### Step 5: Calculate Final Score and Rank

**Final Post Score = Engagement + Recency + Relevance + Quality**

#### Step 6: Filtering

Exclude posts that:
- Match the currently viewing post ID
- Are in the user's liked posts list

#### Step 7: Selection

- Sort all remaining posts by Final Score (descending)
- Select top 15 posts with highest scores
- Return as suggested posts

### Bitz Suggestions Algorithm

#### Step 1: Calculate Engagement Score

**Engagement Score = ((Views / 1,000,000 × 0.3) + (Likes / 100,000 × 0.3) + (Comments / 10,000 × 0.2) + (Engagement Ratio × 1000 × 0.2)) / 10 × 0.40**

Where:
- Engagement Ratio = (Likes - Dislikes) / (Likes + Dislikes + 1)
- Views normalized by 1 million
- Likes normalized by 100,000
- Comments normalized by 10,000
- Final value multiplied by 0.40 weight

#### Step 2: Calculate Recency Score

**Recency Score = Recency Value × 0.25**

Uses same recency calculation as videos (exponential decay)

#### Step 3: Calculate Relevance Score

**Relevance Score = Relevance Value × 0.20**

Relevance Value calculation:
- Start with base value: 0
- If bit is from user's preferred channels: +0.15
- If bit is in user's like history: -0.10 (penalty)
- If bit is in user's watch history: -0.05 (penalty)
- Final value multiplied by 0.20 weight

#### Step 4: Calculate Quality Score

**Quality Score = Quality Value × 0.15**

Quality Value calculation:
- Like ratio component: (Likes / (Likes + Dislikes + 1)) × 0.6
- Comments component: (Comments / 1000) × 0.4
- Sum of components multiplied by 0.15 weight

#### Step 5: Calculate Final Score and Rank

**Final Bit Score = Engagement + Recency + Relevance + Quality**

#### Step 6: Filtering

Exclude bitz that:
- Match the currently viewing bit ID
- Are in the user's watch history

#### Step 7: Selection

- Sort all remaining bitz by Final Score (descending)
- Select top 10 bitz with highest scores
- Return as suggested bitz

### Trending Content Algorithm

Trending content uses a velocity-based scoring system that emphasizes how quickly content is gaining engagement.

#### Step 1: Calculate Velocity Score

**Velocity Score = Views / (Hours Since Publication + 1) × 0.5**

This measures how fast content is gaining views. Higher velocity indicates trending content.

#### Step 2: Calculate Engagement Rate

**Engagement Rate Score = (Likes / (Views + 1)) × 1000 × 0.3**

This measures the percentage of viewers who engage with the content.

#### Step 3: Apply Recency Boost

**Recency Boost Multiplier:**
- For 24-hour window: If content < 24 hours old, multiply by 1.5; else multiply by 0.5
- For 7-day window: Multiply by 1.0 (no boost)
- For 30-day window: Multiply by 1.0 (no boost)

#### Step 4: Calculate Final Trending Score

**Final Trending Score = (Velocity Score + Engagement Rate Score) × Recency Boost**

#### Step 5: Selection

- Sort all content by Final Trending Score (descending)
- Select top 10 items per content type
- Return as trending content

## Helper Calculations

### View Count Parsing

Convert view count strings to numeric values:
- "1.2M views" → 1,200,000
- "856K views" → 856,000
- "432 views" → 432

Formula:
- Extract number and unit (M, K, or none)
- Multiply by: M = 1,000,000, K = 1,000, none = 1

### Time Parsing

Convert time-ago strings to hours:
- "2 hours ago" → 2 hours
- "5 days ago" → 120 hours (5 × 24)
- "1 week ago" → 168 hours (7 × 24)
- "2 months ago" → 1440 hours (2 × 30 × 24)

### Recency Decay Function

The recency score uses exponential decay to favor newer content:

**Recency Value = f(hours)**

Where:
- f(h) = 1.0 if h < 1
- f(h) = 0.9 - (h / 240) if 1 ≤ h < 24
- f(h) = 0.7 - ((h - 24) / 1440) if 24 ≤ h < 168
- f(h) = 0.5 - ((h - 168) / 11040) if 168 ≤ h < 720
- f(h) = 0.1 if h ≥ 720

This ensures content published in the last hour gets maximum recency score, with gradual decrease as content ages.

#### Mathematical Properties of Recency Function

The recency function f(h) exhibits the following mathematical properties:

1. **Monotonicity**: f(h₁) ≥ f(h₂) for h₁ < h₂ (non-increasing function)
2. **Continuity**: Piecewise continuous with discontinuities at h ∈ {1, 24, 168, 720}
3. **Boundedness**: f(h) ∈ [0.1, 1.0] for all h ≥ 0
4. **Asymptotic Behavior**: lim(h→∞) f(h) = 0.1

The function can be approximated by an exponential decay model:

**f(h) ≈ α·e^(-λh) + β**

Where:
- α ≈ 0.9 (initial amplitude)
- λ ≈ 0.001 (decay constant)
- β ≈ 0.1 (asymptotic value)

This follows the **exponential decay law** commonly used in time-series analysis and recommendation systems.

## Algorithm Flow

### For Video Suggestions:

1. **Input**: User ID, current video ID, user watch history, subscribed channels
2. **Process**:
   - For each video in the database:
     - Calculate Engagement Score (40%)
     - Calculate Recency Score (25%)
     - Calculate Relevance Score (20%)
     - Calculate Quality Score (15%)
     - Sum to get Final Score
   - Filter out current video and recently watched videos
   - Sort by Final Score (descending)
3. **Output**: Top 20 videos with highest scores

### For Post Suggestions:

1. **Input**: User ID, current post ID, user interaction history, followed authors
2. **Process**:
   - For each post in the database:
     - Calculate Engagement Score (40%)
     - Calculate Recency Score (25%)
     - Calculate Relevance Score (20%)
     - Calculate Quality Score (15%)
     - Sum to get Final Score
   - Filter out current post and already liked posts
   - Sort by Final Score (descending)
3. **Output**: Top 15 posts with highest scores

### For Bitz Suggestions:

1. **Input**: User ID, current bit ID, user like/watch history, preferred channels
2. **Process**:
   - For each bit in the database:
     - Calculate Engagement Score (40%)
     - Calculate Recency Score (25%)
     - Calculate Relevance Score (20%)
     - Calculate Quality Score (15%)
     - Sum to get Final Score
   - Filter out current bit and watched bitz
   - Sort by Final Score (descending)
3. **Output**: Top 10 bitz with highest scores

### For Trending Content:

1. **Input**: Content type, time window (24h, 7d, 30d)
2. **Process**:
   - For each content item:
     - Calculate Velocity Score (views per hour)
     - Calculate Engagement Rate Score
     - Apply Recency Boost based on time window
     - Calculate Final Trending Score
   - Sort by Final Trending Score (descending)
3. **Output**: Top 10 items per content type

## Data Structures and Algorithms

### Optimal Data Structures

#### 1. Content Indexing Structure

Use a **Hash Map (Dictionary)** for O(1) content lookup:
- Key: Content ID
- Value: Content metadata object
- Time Complexity: O(1) for insertion, deletion, and lookup

#### 2. User History Tracking

Use a **Hash Set** for O(1) membership testing:
- Store user's watched/liked content IDs
- Time Complexity: O(1) for checking if content is in history
- Space Complexity: O(k) where k is the number of items in history

#### 3. Score Storage and Sorting

Use a **Priority Queue (Max Heap)** for efficient top-k selection:
- Store content items with their scores
- Time Complexity: O(n log k) for finding top-k items (better than O(n log n) for full sort)
- Space Complexity: O(k) for maintaining the heap

Alternative: **Partial Sorting** using Quickselect algorithm:
- Time Complexity: O(n) average case for finding top-k
- Space Complexity: O(1) if done in-place

#### 4. Channel/Author Subscriptions

Use a **Hash Set** per user:
- Store subscribed channel/author names
- Time Complexity: O(1) for checking subscription status
- Space Complexity: O(s) where s is the number of subscriptions

#### 5. Score Caching

Use a **Time-based Hash Map with TTL (Time To Live)**:
- Key: (Content ID, User ID) pair
- Value: Cached score and timestamp
- Automatically expire entries after TTL (e.g., 1 hour)
- Time Complexity: O(1) for cache lookup and insertion

### Algorithm Complexity Analysis

#### Time Complexity

For generating suggestions for one user:

1. **Score Calculation Phase**:
   - For each content item: O(1) per item
   - Total: O(n) where n is the number of content items

2. **Filtering Phase**:
   - Check against user history: O(n × k) where k is history size
   - Using hash set: O(n) (amortized)

3. **Sorting Phase**:
   - Full sort: O(n log n)
   - Top-k selection: O(n log k) using heap, or O(n) using quickselect

**Overall Time Complexity**: O(n log k) where k is the number of suggestions to return

#### Space Complexity

1. **Content Storage**: O(n) for n content items
2. **User History**: O(k) per user for k items in history
3. **Score Array**: O(n) for storing scores
4. **Top-k Heap**: O(k) for maintaining top-k items

**Overall Space Complexity**: O(n + k) per user

### Graph Theory Applications

The recommendation system can be modeled as a **bipartite graph**:

**G = (U ∪ C, E)**

Where:
- U: Set of user nodes
- C: Set of content nodes
- E: Set of edges representing user-content interactions

Edge weights can represent:
- Watch time
- Like/dislike ratio
- Completion rate
- Interaction frequency

#### Graph-based Algorithms

1. **Collaborative Filtering via Graph**:
   - Find users similar to target user using **Jaccard Similarity** on neighbor sets
   - Recommend content liked by similar users
   - Similarity: J(u₁, u₂) = |N(u₁) ∩ N(u₂)| / |N(u₁) ∪ N(u₂)|

2. **PageRank Variant**:
   - Apply **Personalized PageRank** to rank content
   - Random walk with restart probability α
   - Higher probability of visiting content connected to user's preferences

3. **Shortest Path Recommendations**:
   - Use **Dijkstra's Algorithm** to find content with shortest path from user's liked content
   - Path length inversely proportional to recommendation strength

### Statistical Methods

#### 1. Normalization Techniques

**Min-Max Normalization**:
For engagement metrics with different scales:
- E_normalized = (E - E_min) / (E_max - E_min)
- Ensures all scores are in [0, 1] range

**Z-Score Normalization**:
For engagement metrics following normal distribution:
- E_z = (E - μ) / σ
- Where μ is mean and σ is standard deviation

#### 2. Weighted Average with Confidence Intervals

Calculate weighted average with confidence:
- Score = Σ(wᵢ × sᵢ) / Σwᵢ
- Confidence = 1 / (1 + σ²) where σ² is variance of scores

#### 3. Bayesian Approach

Use **Bayesian Inference** for quality estimation:
- Prior: P(Quality = High) = 0.5
- Likelihood: P(High Engagement | Quality = High)
- Posterior: P(Quality = High | High Engagement) using Bayes' theorem

**Bayes' Theorem**: P(A|B) = P(B|A) × P(A) / P(B)

### Optimization Techniques

#### 1. Greedy Algorithm for Top-k Selection

Instead of full sorting, use **greedy selection**:
- Maintain a min-heap of size k
- For each content item:
  - If heap size < k: Insert item
  - Else if item score > min heap score: Replace min with item
- Time Complexity: O(n log k) vs O(n log n) for full sort

#### 2. Lazy Evaluation

Calculate scores on-demand:
- Only compute scores for content that passes initial filters
- Reduces computation from O(n) to O(m) where m << n

#### 3. Incremental Updates

Instead of recalculating all scores:
- Maintain running averages for engagement metrics
- Update scores incrementally when new interactions occur
- Time Complexity: O(1) per update vs O(n) for full recalculation

#### 4. Approximation Algorithms

For very large content sets, use **sampling**:
- Randomly sample subset of content
- Calculate scores only for sampled items
- Use **Central Limit Theorem** to estimate true distribution
- Reduces computation while maintaining accuracy

## Performance Considerations

1. **Caching**: Final scores can be cached for 1 hour to reduce computation
   - Cache hit reduces time from O(n log k) to O(1)
   - Cache invalidation strategy: Time-based TTL

2. **Batch Processing**: Calculate scores for all content in batches rather than individually
   - Reduces overhead from O(n) function calls to O(n/b) batch operations
   - Better CPU cache utilization

3. **Indexing**: Index content by channel, author, and category for faster filtering
   - Use **B-tree** or **Hash Index** for O(log n) or O(1) lookups
   - Inverted index for category-based filtering

4. **Pagination**: Return suggestions in pages (e.g., 20 at a time) to reduce load time
   - Use **cursor-based pagination** for consistent results
   - Time Complexity: O(k) per page where k is page size

5. **Lazy Loading**: Calculate and load additional suggestions as user scrolls
   - Pre-compute next page while user views current page
   - Reduces perceived latency

6. **Parallel Processing**: 
   - Calculate scores in parallel using multiple threads/processes
   - Time Complexity: O(n log k / p) where p is number of processors
   - Amdahl's Law: Speedup = 1 / (S + (1-S)/p) where S is sequential fraction

## Algorithm Tuning

The weights in the scoring formula can be adjusted based on:
- User engagement patterns
- Platform analytics
- A/B testing results
- Business objectives

Current weights:
- Engagement: 40% (most important)
- Recency: 25% (important for freshness)
- Relevance: 20% (important for personalization)
- Quality: 15% (important for content standards)

### Mathematical Optimization of Weights

The weight optimization problem can be formulated as:

**Minimize**: L(w) = Σᵢ (yᵢ - ŷᵢ(w))²

**Subject to**:
- wₑ + wᵣ + wₗ + wq = 1
- wᵢ ≥ 0 for all i
- wᵢ ≤ 1 for all i

Where:
- yᵢ: Actual user engagement (ground truth)
- ŷᵢ(w): Predicted engagement using weights w
- L(w): Loss function (Mean Squared Error)

This is a **constrained optimization problem** that can be solved using:
- **Gradient Descent** with projection to satisfy constraints
- **Lagrange Multipliers** for equality constraint
- **Simplex Method** if formulated as linear programming

### Multi-Objective Optimization

Since we have multiple objectives (engagement, recency, relevance, quality), we can use:

**Pareto Optimality**: Find weights where no single objective can be improved without degrading another.

**Weighted Sum Method**:
- Combine objectives: f(w) = Σᵢ λᵢ·fᵢ(w)
- Where λᵢ are importance weights for each objective
- Current: λₑ = 0.40, λᵣ = 0.25, λₗ = 0.20, λq = 0.15

### Hyperparameter Tuning

Use **Grid Search** or **Random Search** to find optimal weights:
- Grid Search: Test all combinations in a grid
- Time Complexity: O(kᵈ) where k is grid size, d is number of parameters
- Random Search: Sample random combinations
- More efficient for high-dimensional spaces

**Bayesian Optimization** can be used for more efficient search:
- Build probabilistic model of objective function
- Use acquisition function to select next point to evaluate
- Converges faster than random search

## Advanced Mathematical Concepts

### Information Theory Applications

#### Entropy-Based Diversity

To ensure diverse recommendations, use **Shannon Entropy**:

**H(S) = -Σᵢ pᵢ log₂(pᵢ)**

Where:
- S: Set of recommended content
- pᵢ: Probability of content type i in recommendations
- Higher entropy = more diversity

**Diversity Score**: D(S) = H(S) / H_max

Where H_max is maximum possible entropy (all content types equally represented).

#### Mutual Information for Relevance

Measure relevance using **Mutual Information**:

**I(U; C) = H(U) - H(U|C)**

Where:
- I(U; C): Mutual information between user preferences U and content C
- Higher mutual information = better relevance

### Linear Algebra Applications

#### Vector Space Model

Represent content and users as vectors in high-dimensional space:

**Content Vector**: c⃗ = [E(c), R(c), Q(c), ...]
**User Vector**: u⃗ = [preference₁, preference₂, ...]

**Similarity**: Use **Cosine Similarity**:

**cos(θ) = (u⃗ · c⃗) / (||u⃗|| × ||c⃗||)**

Where:
- θ: Angle between vectors
- Higher cosine similarity = better match

#### Matrix Factorization

Decompose user-content interaction matrix:

**R ≈ U × Cᵀ**

Where:
- R: m × n interaction matrix
- U: m × k user feature matrix
- C: n × k content feature matrix
- k: Number of latent factors

Use **Singular Value Decomposition (SVD)** or **Non-negative Matrix Factorization (NMF)**.

### Probability and Statistics

#### Expected Value Calculation

Calculate expected engagement for content:

**E[Engagement] = Σᵢ P(User Type i) × Engagement(i)**

Where P(User Type i) is probability of user belonging to type i.

#### Confidence Intervals

Provide confidence bounds for recommendations:

**Score ± z × SE**

Where:
- z: Z-score for desired confidence level (1.96 for 95%)
- SE: Standard error of the score

#### Hypothesis Testing

Test if recommendation is significantly better than random:

**H₀**: Recommendation score = Random score
**H₁**: Recommendation score > Random score

Use **t-test** or **Mann-Whitney U test** depending on distribution.

### Machine Learning Foundations

#### Gradient Descent for Weight Learning

Update weights iteratively:

**wᵢ^(t+1) = wᵢ^(t) - α × (∂L/∂wᵢ)**

Where:
- α: Learning rate
- ∂L/∂wᵢ: Gradient of loss function with respect to weight i
- t: Iteration number

#### Regularization

Prevent overfitting using **L1 (Lasso)** or **L2 (Ridge)** regularization:

**L_regularized = L + λ × ||w||**

Where:
- λ: Regularization parameter
- ||w||: Norm of weight vector

## Future Enhancements

1. **Machine Learning Integration**: Use ML models to learn optimal weights from user behavior
   - **Neural Networks**: Multi-layer perceptron for non-linear relationships
   - **Reinforcement Learning**: Learn optimal recommendation policy through user feedback
   - **Deep Learning**: Use deep neural networks for feature extraction and scoring

2. **Collaborative Filtering**: Recommend content based on users with similar viewing patterns
   - **User-based CF**: Find similar users using **Pearson Correlation** or **Cosine Similarity**
   - **Item-based CF**: Find similar content items
   - **Matrix Factorization**: Factorize user-content matrix using SVD or NMF

3. **Real-time Updates**: Recalculate scores in real-time as engagement data changes
   - **Streaming Algorithms**: Use **Exponential Moving Average** for real-time score updates
   - **Incremental Updates**: Update only affected scores instead of full recalculation
   - **Event-driven Architecture**: Trigger score updates on new interactions

4. **Diversity Factor**: Ensure suggestions include diverse content types and creators
   - **Maximal Marginal Relevance (MMR)**: Balance relevance and diversity
   - **Shannon Entropy**: Maximize entropy of recommendation set
   - **Coverage Optimization**: Ensure all content types are represented

5. **Context Awareness**: Adjust scores based on time of day, device type, user location
   - **Contextual Bandits**: Learn optimal recommendations for different contexts
   - **Multi-armed Bandit**: Explore-exploit trade-off for new content
   - **Contextual Features**: Include time, device, location in feature vector

6. **User Feedback Loop**: Continuously improve suggestions based on user interactions
   - **Online Learning**: Update model parameters in real-time
   - **A/B Testing**: Compare different algorithm variants
   - **Multi-armed Bandit**: Balance exploration of new strategies with exploitation of best known

7. **Graph Neural Networks**: Use GNNs to model user-content relationships
   - **Graph Convolutional Networks (GCN)**: Aggregate information from neighboring nodes
   - **Graph Attention Networks (GAT)**: Learn attention weights for different neighbors

8. **Causal Inference**: Understand causal relationships between recommendations and engagement
   - **Counterfactual Analysis**: What would engagement be with different recommendations?
   - **Instrumental Variables**: Control for confounding factors
   - **Difference-in-Differences**: Compare treated vs control groups
