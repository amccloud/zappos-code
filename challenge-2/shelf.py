# Create a program that sorts a list of ninja related
# book titles alphabetically. Once sorted, it should
# output them as if they were sitting on a bookshelf.
import sys

def print_shelf(titles):
    for row in map(None, *titles):
       print ' '.join(l if l else ' ' for l in row)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Usage: %s <input_file>' % sys.argv[0])

    with open(sys.argv[1]) as f:
        lines = f.read().split('\n')
        print_shelf(sorted(lines))
