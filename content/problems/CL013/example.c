unsigned int count_halvings(unsigned int n) {
    unsigned int steps = 0;
    while (n > 1) {
        n /= 2;
        ++steps;
    }
    return steps;
}
