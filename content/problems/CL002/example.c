#include <stdio.h>

int main(void) {
    const char *colors[] = {"red", "green", "blue"};
    int count = sizeof(colors) / sizeof(colors[0]);
    int lastIndex = count;

    printf("%s\n", colors[lastIndex]);
    return 0;
}
